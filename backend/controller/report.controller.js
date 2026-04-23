const { pool } = require("../config/supabase.js");
const emailService = require("../utils/email.service.js");
const { startOfWeek, endOfWeek, format } = require('date-fns');

// Helper function to generate report for a single user
const generateAndSendReport = async (user) => {
    try {
        const userId = user.user_id;
        const userEmail = user.email;
        const userName = user.name;

        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(today, { weekStartsOn: 1 });
        const startDateStr = format(start, 'yyyy-MM-dd');
        const endDateStr = format(end, 'yyyy-MM-dd');

        // Optimized Query: Fetch all ledgers, their limits, and their weekly totals in ONE trip
        const { rows: reportData } = await pool.query(
            `SELECT 
                l.ledger_id, 
                l.name as ledger_name, 
                COALESCE(al.daily_limit, 0) as daily_limit,
                COALESCE(SUM(CASE 
                    WHEN t.transaction_type = 'CREDIT' THEN -t.amount 
                    WHEN t.transaction_type = 'DEBIT' THEN t.amount 
                    ELSE 0 
                END), 0) as total_spend
             FROM ledgers l
             LEFT JOIN amount_limit al ON l.ledger_id = al.ledger_id AND l.user_id = al.user_id
             LEFT JOIN transactions t ON l.ledger_id = t.ledger_id AND t.date >= $2 AND t.date <= $3
             WHERE l.user_id = $1
             GROUP BY l.ledger_id, l.name, al.daily_limit`,
            [userId, startDateStr, endDateStr]
        );

        if (reportData.length === 0) {
            console.log(`Skipping user ${userId}: No ledgers found`);
            return { userId, status: 'skipped', reason: 'No ledgers found' };
        }

        let ledgerReportsHtml = '';
        let hasData = false;

        for (const ledger of reportData) {
            const dailyLimit = parseFloat(ledger.daily_limit);
            const totalSpend = parseFloat(ledger.total_spend);
            
            // Skip ledgers with no activity and no limits
            if (dailyLimit === 0 && totalSpend === 0) continue;

            const weeklyLimit = dailyLimit * 7;
            const remaining = weeklyLimit - totalSpend;
            const isOverspent = remaining < 0;
            const difference = Math.abs(remaining).toFixed(2);
            hasData = true;

            ledgerReportsHtml += `
                <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4F46E5; color: white; padding: 10px 15px;">
                        <h3 style="margin: 0; font-size: 16px;">Ledger: ${ledger.ledger_name}</h3>
                    </div>
                    <div style="padding: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #6B7280;">Weekly Limit:</span>
                            <strong style="color: #111827;">₹${weeklyLimit}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span style="color: #6B7280;">Total Spent:</span>
                            <strong style="color: #111827;">₹${totalSpend.toFixed(2)}</strong>
                        </div>
                        
                        <div style="text-align: center; padding: 15px; background-color: ${isOverspent ? '#FEE2E2' : '#D1FAE5'}; border-radius: 6px; color: ${isOverspent ? '#B91C1C' : '#047857'};">
                            <p style="margin: 0; font-weight: bold;">
                                ${isOverspent ? '⚠️ Overspent' : '🎉 Within Budget'}
                            </p>
                            <p style="margin: 5px 0 0; font-size: 14px;">
                                You have ${isOverspent ? 'exceeded' : 'saved'} <strong>₹${difference}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }

        if (!hasData) {
            return { userId, status: 'skipped', reason: 'No reportable data across ledgers' };
        }

        // 4. Generate HTML Report
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4F46E5; text-align: center;">Weekly Spending Report</h2>
                <p>Hi ${userName},</p>
                <p>Here is your spending summary across all your ledgers for this week (${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}):</p>
                
                <div style="margin-top: 20px;">
                    ${ledgerReportsHtml}
                </div>

                <p style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px;">
                    Keep tracking your expenses to stay within budget!
                </p>
            </div>
        `;

        // 5. Send Email
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
        const { rows: users } = await pool.query(
            'SELECT user_id, email, name FROM users WHERE email IS NOT NULL'
        );

        
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

