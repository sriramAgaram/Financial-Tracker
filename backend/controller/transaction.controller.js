const { pool } = require("../config/supabase.js");
const { getTransactionFields } = require("../models/transaction.model.js");

exports.add = async (req, res) => {
    try {
        let userInput = req.body;
        userInput['user_id'] =  req.user.userId;
        let transactionInsertData = getTransactionFields(userInput);
        
        const keys = Object.keys(transactionInsertData);
        const values = Object.values(transactionInsertData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const { rows } = await pool.query(
            `INSERT INTO transactions (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
            values
        );

        res.status(201).json({
            status: true,
            msg: 'Transaction created successfully',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
        console.error(error)
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        updateData['user_id'] =  req.user.userId;
        let transactionUpdateData = getTransactionFields(updateData);
        
        const keys = Object.keys(transactionUpdateData);
        const values = Object.values(transactionUpdateData);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        
        const { rows } = await pool.query(
            `UPDATE transactions SET ${setClause} WHERE transaction_id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`,
            [...values, id, req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ status: false, msg: 'Transaction not found' });
        }

        res.status(200).json({
            status: true,
            msg: "Transaction updated successfully",
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}

exports.lists = async (req, res) => {
    try {
        const { pageNumber, rows: limitRowsCount, category, fromDate, toDate } = req.body;
        const offset = (pageNumber - 1) * limitRowsCount;
        const user_id = req.user.userId;
        const ledger_id = req.body?.ledger_id || req.query?.ledger_id || null;

        let whereClauses = ['transactions.user_id = $1', 'transactions.ledger_id = $2'];
        let params = [user_id, ledger_id];
        let paramIndex = 3;

        if (category && category.length > 0) {
            whereClauses.push(`transactions.expense_type_id = ANY($${paramIndex})`);
            params.push(category);
            paramIndex++;
        }

        if (fromDate) {
            whereClauses.push(`transactions.date >= $${paramIndex}`);
            params.push(fromDate);
            paramIndex++;
        }
        if (toDate) {
            whereClauses.push(`transactions.date <= $${paramIndex}`);
            params.push(toDate);
            paramIndex++;
        }

        const whereString = whereClauses.join(' AND ');

        // Get Transactions and Total Count in parallel
        const [transactionsRes, countRes, filteredTotalRes] = await Promise.all([
            pool.query(
                `SELECT transactions.transaction_id, transactions.amount, transactions.date, transactions.expense_type_id, transactions.user_id, transactions.ledger_id, transactions.transaction_type, ex.expense_name 
                 FROM transactions LEFT JOIN expense_type ex ON transactions.expense_type_id = ex.expense_type_id 
                WHERE ${whereString} 
                 ORDER BY transactions.date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
                [...params, limitRowsCount, offset]
            ),
            pool.query(`SELECT COUNT(*) FROM transactions WHERE ${whereString}`, params),
            pool.query(
                `SELECT SUM(CASE WHEN transaction_type = 'CREDIT' THEN amount ELSE -amount END) as filtered_total 
                 FROM transactions WHERE ${whereString}`,
                params
            )
        ]);

        res.status(200).json({
            status: true,
            msg: "Transactions fetched successfully",
            data: transactionsRes.rows,
            total_count: parseInt(countRes.rows[0].count),
            filtered_total: parseFloat(filteredTotalRes.rows[0].filtered_total || 0)
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}

// exports.getById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const { data, error } = await supabase
//             .from('transactions')
//             .select('*')
//             .eq('id', id)
//             .single();

//         if (error || !data) {
//             return res.status(404).json({
//                 status: false,
//                 msg: 'Transaction not found'
//             });
//         }

//         res.status(200).json({
//             status: true,
//             msg: "Transaction fetched successfully",
//             data
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             msg: 'Internal server error',
//             error: error.message
//         });
//     }
//     }
// }

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query(
            'DELETE FROM transactions WHERE transaction_id = $1 AND user_id = $2',
            [id, req.user.userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ status: false, msg: 'Transaction not found' });
        }

        res.status(200).json({
            status: true,
            msg: "Transaction deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}

exports.weeklyData = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body;
        const ledger_id = req.body.ledger_id || req.query.ledger_id || null;

        // Perform both queries in parallel: Aggregated daily totals and the Daily Limit
        const [dailyTotalsRes, limitRes] = await Promise.all([
            pool.query(
                `SELECT 
                    TO_CHAR(date, 'YYYY-MM-DD') as transaction_date, 
                    COALESCE(SUM(amount), 0) as total_amount 
                 FROM transactions 
                 WHERE user_id = $1 AND ledger_id = $2 AND transaction_type = 'DEBIT' 
                   AND date >= $3 AND date <= $4 
                 GROUP BY TO_CHAR(date, 'YYYY-MM-DD') 
                 ORDER BY transaction_date`,
                [req.user.userId, ledger_id, fromDate, toDate]
            ),
            pool.query(
                'SELECT daily_limit FROM amount_limit WHERE user_id = $1 AND ledger_id = $2 LIMIT 1',
                [req.user.userId, ledger_id]
            )
        ]);

        const data = dailyTotalsRes.rows;
        const dailyLimit = limitRes.rows[0]?.daily_limit || 0;

        // Extract arrays for chart
        const chartData = data.map(day => parseFloat(day.total_amount));
        const labels = data.map(day => day.transaction_date);

        const overExpenseChartData = data.map(day => 
            (parseFloat(day.total_amount) > dailyLimit) ? parseFloat(day.total_amount) : null
        );
        const overExpenseLabels = data.map(day => day.transaction_date);

        const totalAmount = chartData.reduce((sum, val) => sum + val, 0);

        return res.status(200).json({
            status: true,
            msg: "Transaction Fetched successfully",
            overExpenseChartData,
            overExpenseLabels,
            chartData,      
            labels,      
            totalAmount
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};