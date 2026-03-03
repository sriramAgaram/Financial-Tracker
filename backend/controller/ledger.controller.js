const supabase = require("../config/supabase.js");
const { getLedgerFields } = require("../models/ledger.model.js");

exports.add = async (req, res) => {
    try {
        let userInput = req.body;
        userInput['user_id'] = req.user.userId;
        
        let ledgerData = getLedgerFieldsForCreate(userInput);
        
        const { data: ledger, error } = await supabase
            .from('ledgers')
            .insert([ledgerData])
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to create ledger',
                error: error.message
            });
        }

        const ledgerId = ledger?.ledger_id;
        const userId = req.user.userId;

        // Auto-initialize Limits for the new ledger
        await supabase.from('amount_limit').insert([{
            user_id: userId,
            ledger_id: ledgerId,
            monthly_limit: 1000,
            daily_limit: 100,
            overall_amount: 1000
        }]);

        // Auto-initialize default Expense Type for the new ledger
        await supabase.from('expense_type').insert([{
            user_id: userId,
            ledger_id: ledgerId,
            expense_name: 'Travel Expenses'
        }]);

        res.status(201).json({
            status: true,
            msg: 'Ledger created and initialized successfully',
            data: ledger
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}

exports.lists = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ledgers')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to fetch ledgers',
                error: error.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "Ledgers fetched successfully",
            data
        });
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
        
        let ledgerUpdateData = getLedgerFieldsForUpdate(updateData);
        
        const { data, error } = await supabase
            .from('ledgers')
            .update(ledgerUpdateData)
            .eq('ledger_id', id)
            .eq('user_id', req.user.userId)
            .select();

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to update ledger',
                error: error.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "Ledger updated successfully",
            data
        });
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
        
        const { error } = await supabase
            .from('ledgers')
            .delete()
            .eq('ledger_id', id)
            .eq('user_id', req.user.userId);

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to delete ledger',
                error: error.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "Ledger deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}
