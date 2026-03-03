const supabase = require("../config/supabase.js");
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

        // Get limits data for the user
        const { data: limitsData, error: limitsError } = await supabase
            .from('amount_limit')
            .select('limit_id, user_id, monthly_limit, daily_limit, overall_amount, created_at, updated_at')
            .eq('user_id', userId);

        if (limitsError) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to fetch limits data',
                error: limitsError.message
            });
        }

        // Get expense types data for the user
        const { data: expenseTypesData, error: expenseTypesError } = await supabase
            .from('expense_type')
            .select('expense_type_id, expense_name, user_id, created_at, updated_at')
            .eq('user_id', userId);

        if (expenseTypesError) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to fetch expense types data',
                error: expenseTypesError.message
            });
        }

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
        const ledgerId = req.body.ledger_id || req.query.ledger_id;

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

        const { data: limitData, error: limitError } = await supabase
            .from('amount_limit')
            .select('*')
            .eq('user_id', userId)
            .eq('ledger_id', ledgerId)
            .single();

        if (limitData) {
            // Get monthly transactions for THIS ledger
            const { data: monthlyTransactions, error: monthlyError } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', userId)
                .eq('ledger_id', ledgerId)
                .gte('date', startMonth.toISOString())
                .lt('date', startNextMonth.toISOString());

            // Get daily transactions for THIS ledger
            const { data: dailyTransactions, error: dailyError } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', userId)
                .eq('ledger_id', ledgerId)
                .gte('date', startToday.toISOString())
                .lt('date', startTomorrow.toISOString());

            if (monthlyError || dailyError) {
                throw monthlyError || dailyError;
            }

            const monthlySum = monthlyTransactions?.reduce((sum, transaction) => sum + Number.parseFloat(transaction.amount || 0), 0) || 0;
            const dailySum = dailyTransactions?.reduce((sum, transaction) => sum + Number.parseFloat(transaction.amount || 0), 0) || 0;

            let balanceMonthlyAmt = limitData.monthly_limit - monthlySum;
            let balanceDailyAmt = limitData.daily_limit - dailySum;
            let balanceOverallAmt = limitData.overall_amount - monthlySum;


            res.status(200).json({
                status: true,
                msg: 'Data Fetched Successfully',
                data: { 
                    balanceDailyAmt, 
                    balanceMonthlyAmt, 
                    dailyLimit: limitData.daily_limit, 
                    monthlyLimit: limitData.monthly_limit, 
                    balanceOverallAmt,
                    currentExpense: monthlySum,
                    currentDailyExpense: dailySum
                }
            });
        } else {
            res.status(404).json({ status: false, msg: 'Limit data not found for this ledger' });
        }

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ status: false, msg: 'Server is not responding', error: error.message });
    }
}
