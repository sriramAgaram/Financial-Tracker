const { pool } = require("../config/supabase.js");
const { sendEmail } = require("../utils/email.service");

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { rows } = await pool.query(
            'SELECT user_id, name, username, email, is_verified FROM users WHERE user_id = $1 LIMIT 1',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ status: false, msg: 'User not found' });
        }

        res.status(200).json({ status: true, data: rows[0] });
    } catch (error) {
        console.error("Internal getProfile Error:", error);
        res.status(500).json({ status: false, msg: 'Internal Server Error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, username, email } = req.body;

        // 1. Get current data to compare email
        const { rows: userRows } = await pool.query(
            'SELECT email, is_verified FROM users WHERE user_id = $1 LIMIT 1',
            [userId]
        );

        if (userRows.length === 0) return res.status(404).json({ status: false, msg: 'User not found' });

        const currentUser = userRows[0];
        let is_verified = currentUser.is_verified; 
        if (email !== currentUser.email) {
            is_verified = false; // Mark as unverified if email changed
        }

        const { rows: updatedRows } = await pool.query(
            'UPDATE users SET name = $1, username = $2, email = $3, is_verified = $4 WHERE user_id = $5 RETURNING *',
            [name, username, email, is_verified, userId]
        );

        res.status(200).json({ 
            status: true, 
            msg: 'Profile updated successfully', 
            data: updatedRows[0] 
        });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error: error.message });
    }
};

exports.sendVerificationOtp = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { email, name, username } = req.body;

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Store name, username, email and otp in temp_registrations using raw SQL
        // Upsert logic for PostgreSQL
        await pool.query(
            `INSERT INTO temp_registrations (email, otp, name, username, user_id, created_at, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                email = EXCLUDED.email, 
                otp = EXCLUDED.otp, 
                name = EXCLUDED.name, 
                username = EXCLUDED.username, 
                created_at = EXCLUDED.created_at, 
                expires_at = EXCLUDED.expires_at`,
            [
                email, 
                otp, 
                name, 
                username, 
                userId, 
                new Date(), 
                new Date(Date.now() + 10 * 60 * 1000)
            ]
        );

        const htmlContent = `<h3>Your Verification OTP is: <b>${otp}</b></h3><p>Verify your changes.</p>`;
        await sendEmail(email, 'Verify your email change', htmlContent);

        res.status(200).json({ status: true, msg: 'OTP sent to ' + email });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otp, email } = req.body;

        const { rows: tempRows } = await pool.query(
            'SELECT * FROM temp_registrations WHERE otp = $1 AND email = $2 AND user_id = $3 LIMIT 1',
            [otp, email, userId]
        );

        if (tempRows.length === 0) {
            return res.status(400).json({ status: false, msg: 'Invalid or expired OTP' });
        }

        const tempData = tempRows[0];

        // Update user status and info from temp table (move data to main table)
        await pool.query(
            'UPDATE users SET is_verified = true, name = $1, username = $2, email = $3 WHERE user_id = $4',
            [tempData.name, tempData.username, tempData.email, userId]
        );

        // Cleanup
        await pool.query('DELETE FROM temp_registrations WHERE otp = $1 AND user_id = $2', [otp, userId]);

        res.status(200).json({ status: true, msg: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error: error.message });
    }
};
