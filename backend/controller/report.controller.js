const supabase = require("../config/supabase.js");
const emailService = require("../utils/email.service.js");
const { startOfWeek, endOfWeek, format } = require('date-fns');

// Helper function to generate report for a single user
const generateAndSendReport = async (user) => {
    try {
        const userId = user.user_id;
        const userEmail = user.email;
        const userName = user.name;

        // 1. Get all ledgers for the user
        const { data: ledgers, error: ledgerError } = await supabase
            .from('ledgers')
            .select('ledger_id, ledger_name')
            .eq('user_id', userId);

        if (ledgerError || !ledgers || ledgers.length === 0) {
            console.log(`Skipping user ${userId}: No ledgers found`);
            return { userId, status: 'skipped', reason: 'No ledgers found' };
        }

        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(today, { weekStartsOn: 1 });
        const startDateStr = format(start, 'yyyy-MM-dd');
        const endDateStr = format(end, 'yyyy-MM-dd');

        let ledgerReportsHtml = '';
        let hasData = false;

        for (const ledger of ledgers) {
            const ledgerId = ledger.ledger_id;
            const ledgerName = ledger.ledger_name;

            // 2. Get Limits for this ledger
            const { data: limitData, error: limitError } = await supabase
                .from('amount_limit')
                .select('daily_limit')
                .eq('user_id', userId)
                .eq('ledger_id', ledgerId)
                .single();

            if (limitError || !limitData) {
                continue; // Skip ledgers without limits
            }

            const dailyLimit = limitData.daily_limit;
            const weeklyLimit = dailyLimit * 7;

            // 3. Get Weekly Transaction Total for this ledger
            const { data: transactions, error: transError } = await supabase
                .from('transactions')
                .select('amount, transaction_type')
                .eq('user_id', userId)
                .eq('ledger_id', ledgerId)
                .gte('date', startDateStr)
                .lte('date', endDateStr);

            if (transError) {
                 console.error(`Error fetching transactions for user ${userId}, ledger ${ledgerId}:`, transError);
                 continue;
            }

            const totalSpend = transactions.reduce((sum, t) => {
                return t.transaction_type === 'CREDIT' ? sum - t.amount : sum + t.amount;
            }, 0);

            const remaining = weeklyLimit - totalSpend;
            const isOverspent = remaining < 0;
            const difference = Math.abs(remaining);
            hasData = true;

            ledgerReportsHtml += `
                <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4F46E5; color: white; padding: 10px 15px;">
                        <h3 style="margin: 0; font-size: 16px;">Ledger: ${ledgerName}</h3>
                    </div>
                    <div style="padding: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #6B7280;">Weekly Limit:</span>
                            <strong style="color: #111827;">₹${weeklyLimit}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span style="color: #6B7280;">Total Spent:</span>
                            <strong style="color: #111827;">₹${totalSpend}</strong>
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

