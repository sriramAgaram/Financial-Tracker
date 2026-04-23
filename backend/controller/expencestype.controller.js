const { pool } = require("../config/supabase.js")
const expenseModel = require("../models/expense.model.js")

exports.add = async (req, res) => {
    try {
        let userInput = req.body;
        userInput['user_id'] =req.user.userId;

        const createData = expenseModel.getExpenseTypeForCreate(userInput);

        // Check if exists using raw SQL
        const { rows: existingRows } = await pool.query(
            'SELECT * FROM expense_type WHERE expense_name = $1 AND user_id = $2 AND ledger_id = $3',
            [createData.expense_name, createData.user_id, createData.ledger_id]
        );

        if (existingRows.length > 0) {
            return res.status(400).json({ status: false, msg: 'The Expense Type already exists' });
        }

        const keys = Object.keys(createData);
        const values = Object.values(createData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const { rows } = await pool.query(
            `INSERT INTO expense_type (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
            values
        );

        res.status(201).json({ status: true, msg: "Expense Type created successfully", data: rows });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error });
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;
        const userId = req.user.userId;
        updateData['user_id'] = userId;

        const updateFields = expenseModel.getExpenseTypeForUpdate(updateData);

        // Check if exists
        const { rows: existingRows } = await pool.query(
            'SELECT * FROM expense_type WHERE expense_type_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ status: false, msg: 'Expense Type not found' });
        }

        if (updateFields.expense_name) {
            const { rows: conflictingRows } = await pool.query(
                'SELECT * FROM expense_type WHERE expense_name = $1 AND user_id = $2 AND ledger_id = $3 AND expense_type_id != $4',
                [updateFields.expense_name, userId, updateFields.ledger_id, id]
            );

            if (conflictingRows.length > 0) {
                return res.status(400).json({ status: false, msg: 'Another Expense Type with this name already exists' });
            }
        }

        const keys = Object.keys(updateFields);
        const values = Object.values(updateFields);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

        const { rows } = await pool.query(
            `UPDATE expense_type SET ${setClause} WHERE expense_type_id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`,
            [...values, id, userId]
        );

        res.status(200).json({ status: true, msg: "Expense Type updated successfully", data: rows });
    } catch (error) {
        console.error('Internal server Error', error)
        res.status(500).json({ status: false, msg: 'Internal Server Error', error });
    }
}

exports.lists = async (req, res) => {
    try {
        const ledger_id = req.query.ledger_id || req.body.ledger_id || null;

        const { rows } = await pool.query(
            'SELECT * FROM expense_type WHERE user_id = $1 AND ledger_id = $2 ORDER BY created_at DESC',
            [req.user.userId, ledger_id]
        );

        res.status(200).json({ status: true, msg: "Expense Types fetched successfully", data: rows });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error });
    }
}

// exports.getById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const { data, error } = await supabase
//             .from('expense_type')
//             .select('*')
//             .eq('expense_type_id', id)
//             .single();

//         if (error || !data) {
//             return res.status(404).json({ status: false, msg: 'Expense Type not found' });
//         }

//         res.status(200).json({ status: true, msg: "Expense Type fetched successfully", data });
//     } catch (error) {
//         res.status(500).json({ status: false, msg: 'Internal Server Error', error });
//     }
// }

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query(
            'DELETE FROM expense_type WHERE expense_type_id = $1 AND user_id = $2',
            [id, req.user.userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ status: false, msg: 'Expense Type not found' });
        }

        res.status(200).json({ status: true, msg: "Expense Type deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error });
    }
}
