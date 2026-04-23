const { pool } = require("../config/supabase.js");
const limitModel = require("../models/limit.model.js");

exports.add = async (req, res) => {
    try {
        const userInput = req.body;
        userInput['user_id'] = req.user.userId
        const createData = limitModel.getLimitForCreate(userInput);

        if (!createData.daily_limit || !createData.user_id) {
            return res.status(400).json({ status: false, msg: 'Missing required fields: daily_limit, user_id' });
        }

        const keys = Object.keys(createData);
        const values = Object.values(createData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        try {
            const { rows } = await pool.query(
                `INSERT INTO amount_limit (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
                values
            );
            res.status(201).json({ status: true, msg: 'Limit created successfully', data: rows });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({ status: false, msg: 'This Ledger already has a limit set. Use update instead.' });
            }
            throw error;
        }
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
        updateData['user_id'] = userId;

        const updateFields = limitModel.getLimitForUpdate(updateData);
        const keys = Object.keys(updateFields);
        const values = Object.values(updateFields);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

        const { rows } = await pool.query(
            `UPDATE amount_limit SET ${setClause} WHERE limit_id = $${keys.length + 1} AND ledger_id = $${keys.length + 2} AND user_id = $${keys.length + 3} RETURNING *`,
            [...values, id, updateData.ledger_id, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ status: false, msg: 'Limit not found' });
        }

        res.status(200).json({ status: true, msg: "Limit updated successfully", data: rows });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}

exports.getAll = async (req, res) => {
    try {
        const ledger_id = req.query.ledger_id || req.body.ledger_id || null;

        const { rows } = await pool.query(
            'SELECT * FROM amount_limit WHERE user_id = $1 AND ledger_id = $2 ORDER BY created_at DESC',
            [req.user.userId, ledger_id]
        );

        res.status(200).json({ status: true, msg: "Limits fetched successfully", data: rows });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            'SELECT * FROM amount_limit WHERE limit_id = $1 AND user_id = $2 LIMIT 1',
            [id, req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ status: false, msg: 'Limit not found' });
        }

        res.status(200).json({ status: true, msg: "Limit fetched successfully", data: rows[0] });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}

exports.getByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const { rows } = await pool.query(
            'SELECT * FROM amount_limit WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.status(200).json({ status: true, msg: "User limits fetched successfully", data: rows });
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
            'DELETE FROM amount_limit WHERE limit_id = $1 AND user_id = $2',
            [id, req.user.userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ status: false, msg: 'Limit not found' });
        }

        res.status(200).json({ status: true, msg: "Limit deleted successfully" });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}
