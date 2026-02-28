const supabase = require("../config/supabase.js");
const { getLedgerFields } = require("../models/ledger.model.js");

exports.add = async (req, res) => {
    try {
        let userInput = req.body;
        userInput['user_id'] = req.user.userId;
        
        let ledgerData = getLedgerFields(userInput);
        
        const { data, error } = await supabase
            .from('ledgers')
            .insert([ledgerData])
            .select();

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to create ledger',
                error: error.message
            });
        }

        res.status(201).json({
            status: true,
            msg: 'Ledger created successfully',
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
        
        let ledgerUpdateData = getLedgerFields(updateData);
        
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
