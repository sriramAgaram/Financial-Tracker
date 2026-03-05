const supabase = require("../config/supabase.js");
const emailService = require("../utils/email.service.js");
const { startOfWeek, endOfWeek, format } = require('date-fns');

// Helper function to generate report for a single user
const generateAndSendReport = async (user) => {
    try {
        const userId = user.user_id;
        const userEmail = user.email;
        const userName = user.name;

        // 1. Get Limits
        const { data: limitData, error: limitError } = await supabase
            .from('amount_limit')
            .select('daily_limit')
            .eq('user_id', userId)
            .single();

        if (limitError || !limitData) {
            console.log(`Skipping user ${userId}: Limits not found`);
            return { userId, status: 'skipped', reason: 'No limits set' };
        }

        const dailyLimit = limitData.daily_limit;
        const weeklyLimit = dailyLimit * 7;

        // 2. Get Weekly Transaction Total
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(today, { weekStartsOn: 1 });

        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId)
            .gte('date', format(start, 'yyyy-MM-dd'))
            .lte('date', format(end, 'yyyy-MM-dd'));

        if (transError) {
             console.error(`Error fetching transactions for user ${userId}:`, transError);
             return { userId, status: 'failed', reason: 'Transaction fetch error' };
        }

        const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
        const remaining = weeklyLimit - totalSpend;
        const isOverspent = remaining < 0;
        const difference = Math.abs(remaining);

        // 3. Generate HTML Report
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4F46E5; text-align: center;">Weekly Spending Report</h2>
                <p>Hi ${userName},</p>
                <p>Here is your spending summary for this week (${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}):</p>
                
                <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Weekly Limit:</strong> ₹${weeklyLimit}</p>
                    <p style="margin: 5px 0;"><strong>Total Spent:</strong> ₹${totalSpend}</p>
                </div>

                <div style="text-align: center; padding: 20px; background-color: ${isOverspent ? '#FEE2E2' : '#D1FAE5'}; border-radius: 8px; color: ${isOverspent ? '#B91C1C' : '#047857'};">
                    <h3 style="margin: 0;">${isOverspent ? '⚠️ You Overspent!' : '🎉 Great Job!'}</h3>
                    <p style="font-size: 18px; margin-top: 10px;">
                        You have ${isOverspent ? 'exceeded' : 'saved'} <strong>₹${difference}</strong> this week.
                    </p>
                </div>

                <p style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px;">
                    Keep tracking your expenses to stay within budget!
                </p>
            </div>
        `;

        // 4. Send Email
        const emailResult = await emailService.sendEmail(userEmail, 'Your Weekly Spending Report', htmlContent);

        if (emailResult.success) {
            return { userId, status: 'success' };
        } else {
            return { userId, status: 'failed', reason: 'Email send error', error: emailResult.error };
        }

    } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error);
        return { userId: user.user_id, status: 'failed', reason: 'Internal error', error: error.message };
    }
};

exports.sendWeeklyReportToAll = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('user_id, email, name')
            .not('email', 'is', null);

        if (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({ status: false, msg: 'Failed to fetch users', error });
        }
        
        // 2. Process each user
        const results = [];
        for (const user of users) {
            if (!user.email) continue; // Skip if no email (redundant check but safe)
            const result = await generateAndSendReport(user);
            results.push(result);
        }

        const successCount = results.filter(r => r.status === 'success').length;
        const failedCount = results.filter(r => r.status === 'failed').length;
        const skippedCount = results.filter(r => r.status === 'skipped').length;

        console.log(`Report Summary: Success=${successCount}, Failed=${failedCount}, Skipped=${skippedCount}`);

        res.status(200).json({
            status: true,
            msg: 'Weekly report process completed',
            summary: {
                total: users.length,
                success: successCount,
                failed: failedCount,
                skipped: skippedCount
            },
            details: results
        });

    } catch (error) {
        console.error("Critical error in weekly report cron:", error);
        res.status(500).json({ status: false, msg: 'Internal Server Error', error: error.message });
    }
};

