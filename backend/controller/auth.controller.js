const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require("../config/supabase.js");
const { getAuthFields } = require('../models/auth.model.js');

exports.initiateSignup = async (req, res, next) => {
    try {
        const { name, username, email } = req.body;
        
        // 1. Check if user already exists in main table
        const { rows: existingRows } = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2 LIMIT 1',
            [username, email]
        );

        if (existingRows.length > 0) {
            return res.status(400).json({ status: false, msg: 'Username or Email already exists' });
        }

        // 2. Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        // 3. Store in temp_registrations (Upsert logic)
        await pool.query(
            `INSERT INTO temp_registrations (email, username, name, otp, created_at, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (email) 
             DO UPDATE SET 
                username = EXCLUDED.username,
                name = EXCLUDED.name,
                otp = EXCLUDED.otp,
                created_at = EXCLUDED.created_at,
                expires_at = EXCLUDED.expires_at`,
            [email, username, name, otp, new Date(), new Date(Date.now() + 10 * 60 * 1000)]
        );

        // 4. Send Email
        const { sendEmail } = require('../utils/email.service');
        const htmlContent = `<h3>Your Signup OTP is: <b>${otp}</b></h3><p>It expires in 10 minutes.</p>`;
        const emailResult = await sendEmail(email, 'Verify your email', htmlContent);

        if (!emailResult.success) {
             return res.status(500).json({ status: false, msg: 'Failed to send OTP email' });
        }

        res.status(200).json({ status: true, msg: "OTP sent successfully to your email" });

    } catch (error) {
        console.error('Initiate Signup Error:', error);
        res.status(500).json({ status: false, msg: 'Initiate Signup Failed', error });
    }
}

exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        
        const { rows } = await pool.query(
            'SELECT * FROM temp_registrations WHERE email = $1 AND otp = $2 LIMIT 1',
            [email, otp]
        );

        if (rows.length === 0) {
            return res.status(400).json({ status: false, msg: 'Invalid OTP or Email' });
        }

        const data = rows[0];

        if (new Date(data.expires_at) < new Date()) {
            return res.status(400).json({ status: false, msg: 'OTP has expired' });
        }

        // Generate temporary signup token
        const signupToken = jwt.sign({ email, type: 'signup' }, process.env.JWT_SECRET, { expiresIn: '20m' });

        res.status(200).json({ status: true, msg: "OTP Verified Successfully", signupToken });

    } catch (error) {
        res.status(500).json({ status: false, msg: 'Verification Failed', error });
    }
}

exports.completeSignup = async (req, res, next) => {
    try {
        const { signupToken, password, confirmPassword } = req.body;

        if (!signupToken) return res.status(400).json({ status: false, msg: 'Missing signup token' });
        if (password !== confirmPassword) return res.status(400).json({ status: false, msg: 'Passwords do not match' });

        let decoded;
        try {
            decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ status: false, msg: 'Invalid or expired signup token' });
        }

        const email = decoded.email;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Verify availability in temp table
            const { rows: tempRows } = await client.query(
                'SELECT * FROM temp_registrations WHERE email = $1 LIMIT 1',
                [email]
            );

            if (tempRows.length === 0) {
                return res.status(400).json({ status: false, msg: 'Signup session invalid or expired' });
            }

            const tempData = tempRows[0];
            const bcryptPass = await bcrypt.hash(password, 13);
            
            let signupFields = getAuthFields({
                name: tempData.name, 
                username: tempData.username, 
                email: tempData.email
            });
            signupFields['password'] = bcryptPass;

            // 4. Insert into Users
            const keys = Object.keys(signupFields);
            const values = Object.values(signupFields);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

            const { rows: userRows } = await client.query(
                `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
                values
            );
            const userData = userRows[0];

            // 5. Initialize User Data (Ledger, Limits & Expense Types)
            const { rows: ledgerRows } = await client.query(
                'INSERT INTO ledgers (user_id, name, is_default) VALUES ($1, $2, $3) RETURNING *',
                [userData.user_id, 'Personal', true]
            );
            const ledgerId = ledgerRows[0].ledger_id;

            await client.query(
                `INSERT INTO amount_limit (user_id, ledger_id, monthly_limit, daily_limit, overall_amount) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [userData.user_id, ledgerId, 1000, 100, 1000]
            );

            await client.query(
                `INSERT INTO expense_type (user_id, ledger_id, expense_name, type) 
                 VALUES ($1, $2, $3, $4)`,
                [userData.user_id, ledgerId, 'Travel Expenses', 'DEBIT']
            );

            // 6. Cleanup Temp Table
            await client.query('DELETE FROM temp_registrations WHERE email = $1', [email]);

            await client.query('COMMIT');
            res.status(200).json({ status: true, msg: "User signed up successfully. Please login.", data: userData });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Complete Signup Error:', error);
        res.status(500).json({ status: false, msg: 'Signup Failed', error });
    }
}


exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if(!username || !password){
            return res.status(404).json({status: false , msg: 'Login Fields are Missing...'})
        }

        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({ status: false, msg: 'Invalid username or password' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ status: false, msg: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ status: true, msg: "User logged in successfully", token })
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Login failed', error });
        console.error('Login Failed', error)
    }
}
