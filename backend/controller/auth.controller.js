const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require("../config/supabase.js");
const { getAuthFields } = require('../models/auth.model.js');

exports.initiateSignup = async (req, res, next) => {
    try {
        const { name, username, email } = req.body;
        
        // 1. Check if user already exists in main table
        const { data: existingUser, error } = await supabase.from('users').select("*").or(`username.eq.${username},email.eq.${email}`).single();
        if (existingUser) {
            return res.status(400).json({ status: false, msg: 'Username or Email already exists' });
        }

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Store in temp_registrations (Upsert to handle retry)
        const { error: tempError } = await supabase.from('temp_registrations').upsert({
            email,
            username,
            name,
            otp,
            created_at: new Date(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        });

        if (tempError) {
            console.error('Temp Insert Error:', tempError);
            return res.status(500).json({ status: false, msg: 'Failed to initiate signup', error: tempError });
        }

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
        
        const { data, error } = await supabase.from('temp_registrations')
            .select("*")
            .eq('email', email)
            .eq('otp', otp)
            .single();

        if (error || !data) {
            return res.status(400).json({ status: false, msg: 'Invalid OTP or Email' });
        }

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

        if (!signupToken) {
            return res.status(400).json({ status: false, msg: 'Missing signup token' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ status: false, msg: 'Passwords do not match' });
        }

        // Verify Token
        let decoded;
        try {
            decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ status: false, msg: 'Invalid or expired signup token' });
        }

        const email = decoded.email;

        // 1. Verify availability in temp table
        const { data: tempData, error: tempError } = await supabase.from('temp_registrations')
            .select("*")
            .eq('email', email)
            .single();

        if (tempError || !tempData) {
            return res.status(400).json({ status: false, msg: 'Signup session invalid or expired' });
        }

        // 2. Hash Password
        const bcryptPass = await bcrypt.hash(password, 13);
        
        // 3. Prepare User Data
        let signupFields = getAuthFields({
            name: tempData.name, 
            username: tempData.username, 
            email: tempData.email
        });
        signupFields['password'] = bcryptPass;

        // 4. Insert into Users
        const { data: userData, error: insertError } = await supabase.from('users').insert([signupFields]).select().single();
        
        if (insertError) {
             return res.status(500).json({ status: false, msg: 'Signup completion failed', error: insertError });
        }

        // 5. Initialize User Data (Limits & Expense Types)
        await supabase.from('amount_limit').insert([{
            user_id: userData.user_id,
            monthly_limit: 1000,
            daily_limit: 100,
            overall_amount: 1000
        }]);

        await supabase.from('expense_type').insert([{
            user_id: userData.user_id,
            expense_name: 'Travel Expenses'
        }]);

        // 6. Cleanup Temp Table
        await supabase.from('temp_registrations').delete().eq('email', email);

        res.status(200).json({ status: true, msg: "User signed up successfully. Please login.", data: userData });

    } catch (error) {
        console.error('Complete Signup Error:', error);
        res.status(500).json({ status: false, msg: 'Signup Failed', error });
    }
}


exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if(!username || !password){
            res.status(404).json({status: false , msg: 'Login Fields are Missing...'})
        }
        const { data: user, error } = await supabase.from('users').select("*").eq('username', username).single();
        if (!user) {
            return res.status(401).json({ status: false, msg: 'Invalid username or password' });
        }
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
