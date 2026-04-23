const { pool } = require("../config/supabase.js");
const { getLedgerFieldsForCreate, getLedgerFieldsForUpdate } = require("../models/ledger.model.js");

exports.add = async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            let userInput = req.body;
            userInput['user_id'] = req.user.userId;
            let ledgerData = getLedgerFieldsForCreate(userInput);
            
            await client.query('BEGIN');

            const keys = Object.keys(ledgerData);
            const values = Object.values(ledgerData);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            
            const { rows: ledgerRows } = await client.query(
                `INSERT INTO ledgers (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
                values
            );

            const ledger = ledgerRows[0];
            const ledgerId = ledger.ledger_id;
            const userId = req.user.userId;

            // Auto-initialize Limits for the new ledger
            await client.query(
                `INSERT INTO amount_limit (user_id, ledger_id, monthly_limit, daily_limit, overall_amount) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, ledgerId, 1000, 100, 1000]
            );

            // Auto-initialize default Expense Type for the new ledger
            await client.query(
                `INSERT INTO expense_type (user_id, ledger_id, expense_name, type) 
                 VALUES ($1, $2, $3, $4)`,
                [userId, ledgerId, 'Travel Expenses', 'DEBIT']
            );

            await client.query('COMMIT');

            res.status(201).json({
                status: true,
                msg: 'Ledger created and initialized successfully',
                data: ledger
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
};

exports.lists = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM ledgers WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.userId]
        );

        res.status(200).json({
            status: true,
            msg: "Ledgers fetched successfully",
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

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user.userId;
        
        let ledgerUpdateData = getLedgerFieldsForUpdate(updateData);
        
        const keys = Object.keys(ledgerUpdateData);
        const values = Object.values(ledgerUpdateData);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

        const { rows } = await pool.query(
            `UPDATE ledgers SET ${setClause} WHERE ledger_id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`,
            [...values, id, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ status: false, msg: 'Ledger not found' });
        }

        res.status(200).json({
            status: true,
            msg: "Ledger updated successfully",
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

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { rowCount } = await pool.query(
            'DELETE FROM ledgers WHERE ledger_id = $1 AND user_id = $2',
            [id, req.user.userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ status: false, msg: 'Ledger not found' });
        }

        res.status(200).json({
            status: true,
            msg: "Ledger deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}
