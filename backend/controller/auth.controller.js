const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require("../config/supabase.js");
const { getAuthFields } = require('../models/auth.model.js');

exports.signup = async (req, res, next) => {
    try {
        const { name, username, password } = req.body;
        const { data: existingUser, error } = await supabase.from('users').select("*").eq("username", username).single();
        if (existingUser) {
            return res.status(400).json({ status: false, msg: 'Username already exists' });
        }
        const bcryptPass = await bcrypt.hash(password, 13);
        let signupFields = getAuthFields({name, username})
        signupFields['password'] = bcryptPass
        const { data, error: insertError } = await supabase.from('users').insert([signupFields]).select().single();
        if (insertError) {
            return res.status(500).json({ status: false, msg: 'Signup failed', error: insertError });
        }

        await supabase.from('amount_limit').insert([{
            user_id: data.user_id,
            monthly_limit: 1000,
            daily_limit: 100,
            overall_amount: 1000
        }]);

        await supabase.from('expense_type').insert([{
            user_id: data.user_id,
            expense_name: 'Travel Expenses'
        }]);



        res.status(200).json({ status: true, msg: "User signed up successfully", data })
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Signup Failed', error })
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
