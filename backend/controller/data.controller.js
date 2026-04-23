const {  pool } = require("../config/supabase.js");
const { startOfMonth, startOfDay, addMonths, addDays } = require('date-fns')

exports.getSettingsData = async (req, res) => {
    try {
        // Get user_id from JWT middleware (req.user.userId)
        const userId = req.user?.userId;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                status: false,
                msg: 'User ID is required'
            });
        }

        // Get limits data for the user using raw SQL
        const { rows: limitsData } = await pool.query(
            'SELECT limit_id, user_id, monthly_limit, daily_limit, overall_amount, created_at, updated_at FROM amount_limit WHERE user_id = $1',
            [userId]
        );

        // Get expense types data for the user using raw SQL
        const { rows: expenseTypesData } = await pool.query(
            'SELECT expense_type_id, expense_name, user_id, created_at, updated_at FROM expense_type WHERE user_id = $1',
            [userId]
        );

        // Combine the data
        const settingsData = {
            limits: limitsData || [],
            expenseTypes: expenseTypesData || [],
            userId: userId,
            totalLimits: limitsData ? limitsData.length : 0,
            totalExpenseTypes: expenseTypesData ? expenseTypesData.length : 0
        };

        res.status(200).json({
            status: true,
            msg: 'Settings data fetched successfully',
            data: settingsData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
};


exports.homedata = async (req, res) => {
    try {
        const userId = req.user?.userId
        
        // Defensive check: req.body and req.query might be undefined in some environments
        const ledgerId = req.body?.ledger_id || req.query?.ledger_id;

        if (!userId) {
            return res.status(400).json({
                status: false,
                msg: 'User ID is required'
            });
        }

        if (!ledgerId) {
            return res.status(400).json({
                status: false,
                msg: 'Ledger ID is required'
            });
        }

        const now = new Date()

        // Use UTC dates to avoid timezone issues
        const startMonth = startOfMonth(now)
        const startToday = startOfDay(now)
        const startNextMonth = startOfMonth(addMonths(now, 1))
        const startTomorrow = startOfDay(addDays(now, 1));

        // Get individual limits for THIS ledger
        const { rows: limitRows } = await pool.query(
            'SELECT * FROM amount_limit WHERE user_id = $1 AND ledger_id = $2 LIMIT 1',
            [userId, ledgerId]
        );
        const limits = limitRows[0] || { monthly_limit: 0, daily_limit: 0, overall_amount: 0 };

        // Optimization: Run all aggregations in SQL instead of fetching records and using .reduce in JS
        // Sum Monthly Income/Expense
        const { rows: monthlyAgg } = await pool.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN transaction_type = 'CREDIT' THEN amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN transaction_type = 'DEBIT' THEN amount ELSE 0 END), 0) as expense
             FROM transactions 
             WHERE user_id = $1 AND ledger_id = $2 AND date >= $3 AND date < $4`,
            [userId, ledgerId, startMonth.toISOString(), startNextMonth.toISOString()]
        );

        // Sum Daily Expense
        const { rows: dailyAgg } = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as expense FROM transactions 
             WHERE user_id = $1 AND ledger_id = $2 AND transaction_type = 'DEBIT' AND date >= $3 AND date < $4`,
            [userId, ledgerId, startToday.toISOString(), startTomorrow.toISOString()]
        );

        // Sum Previous Month Expense
        const startPrevMonth = startOfMonth(addMonths(now, -1));
        const { rows: prevMonthlyAgg } = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as expense FROM transactions 
             WHERE user_id = $1 AND ledger_id = $2 AND transaction_type = 'DEBIT' AND date >= $3 AND date < $4`,
            [userId, ledgerId, startPrevMonth.toISOString(), startMonth.toISOString()]
        );

        // Replace RPC (get_ledger_balance) with raw native SQL for balance calculation
        // overall balance = Opening Balance (overall_amount) + Total Credits - Total Debits
        const { rows: balanceAgg } = await pool.query(
            `SELECT COALESCE(SUM(CASE WHEN transaction_type = 'CREDIT' THEN amount ELSE -amount END), 0) as total_adjustment 
             FROM transactions 
             WHERE user_id = $1 AND ledger_id = $2`,
            [userId, ledgerId]
        );

        const monthlyIncome = Number(monthlyAgg[0]?.income || 0);
        const monthlyExpense = Number(monthlyAgg[0]?.expense || 0);
        const dailyExpense = Number(dailyAgg[0]?.expense || 0);
        const prevMonthExpense = Number(prevMonthlyAgg[0]?.expense || 0);
        const totalBalanceAdjustment = Number(balanceAgg[0]?.total_adjustment || 0);

        let balanceMonthlyAmt = (limits.monthly_limit || 0) - monthlyExpense;
        let balanceDailyAmt = (limits.daily_limit || 0) - dailyExpense;
        let balanceOverallAmt = (limits.overall_amount || 0) + totalBalanceAdjustment;


        res.status(200).json({
            status: true,
            msg: 'Data Fetched Successfully',
            data: { 
                balanceDailyAmt, 
                balanceMonthlyAmt, 
                dailyLimit: limits.daily_limit, 
                monthlyLimit: limits.monthly_limit, 
                balanceOverallAmt,
                currentExpense: monthlyExpense,
                currentIncome: monthlyIncome,
                currentDailyExpense: dailyExpense,
                prevMonthSum: prevMonthExpense
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ status: false, msg: 'Server is not responding', error: error.message });
    }
}
