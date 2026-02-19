const supabase = require("../config/supabase.js");
const { sendEmail } = require("../utils/email.service");

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { data, error } = await supabase
            .from('users')
            .select('user_id, name, username, email, is_verified')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error("Supabase Profile Fetch Error:", error);
            return res.status(500).json({ status: false, msg: 'Error fetching profile', error: error.message });
        }

        if (!data) {
            return res.status(404).json({ status: false, msg: 'User not found' });
        }

        res.status(200).json({ status: true, data });
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
        const { data: currentUser, error: fetchError } = await supabase
            .from('users')
            .select('email, is_verified')
            .eq('user_id', userId)
            .single();

        if (fetchError) return res.status(500).json({ status: false, msg: 'Fetch error' });

        let is_verified = currentUser.is_verified; 
        if (email !== currentUser.email) {
            is_verified = false; // Mark as unverified if email changed
        }

        const { data, error } = await supabase
            .from('users')
            .update({ name, username, email, is_verified })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
             if (error.code === '23505') {
                 return res.status(400).json({ status: false, msg: 'Username or Email already taken' });
             }
             return res.status(500).json({ status: false, msg: 'Update error', error: error.message });
        }

        res.status(200).json({ status: true, msg: 'Profile updated successfully', data });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error: error.message });
    }
};

exports.sendVerificationOtp = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { email, name, username } = req.body;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store name, username, email and otp in temp_registrations
        const { error: tempError } = await supabase.from('temp_registrations').upsert({
            email,
            otp,
            name,
            username,
            user_id: userId, 
            created_at: new Date(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000)
        });

        if (tempError) {
            console.error('OTP Storage Error:', tempError);
            return res.status(500).json({ status: false, msg: 'Failed to store OTP' });
        }

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

        const { data: tempData, error: fetchError } = await supabase
            .from('temp_registrations')
            .select('*')
            .eq('otp', otp)
            .eq('email', email)
            .eq('user_id', userId)
            .single();

        if (fetchError || !tempData) {
            return res.status(400).json({ status: false, msg: 'Invalid or expired OTP' });
        }

        // Update user status and info from temp table (move data to main table)
        const { error: updateError } = await supabase
            .from('users')
            .update({ 
                is_verified: true,
                name: tempData.name,
                username: tempData.username,
                email: tempData.email
            })
            .eq('user_id', userId);

        if (updateError) return res.status(500).json({ status: false, msg: 'Verification update failed' });

        // Cleanup
        await supabase.from('temp_registrations').delete().eq('otp', otp).eq('user_id', userId);

        res.status(200).json({ status: true, msg: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error: error.message });
    }
};
