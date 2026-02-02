const supabase = require("../config/supabase.js");
const { getTransactionFields } = require("../models/transaction.model.js");

exports.add = async (req, res) => {
    try {
        let userInput = req.body;
        userInput['user_id'] =  req.user.userId;
        let transactionInsertData = getTransactionFields(userInput);
        const { data, error } = await supabase
            .from('transactions')
            .insert([transactionInsertData])
            .select();

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to create transaction',
                error: error.message
            });
        }

        res.status(201).json({
            status: true,
            msg: 'Transaction created successfully',
            data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
        console.error(error)
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        updateData['user_id'] =  req.user.userId
        let transactionUpdateData = getTransactionFields(updateData)
        const { data: existingTransaction, error: findError } = await supabase
            .from('transactions')
            .select('*')
            .eq('transaction_id', id)
            .eq('user_id' , req.user.userId)
            .single();

        if (!existingTransaction) {
            return res.status(404).json({
                status: false,
                msg: 'Transaction not found'
            });
        }
        const { data, error: updateError } = await supabase
            .from('transactions')
            .update([transactionUpdateData])
            .eq('transaction_id', id)
            .eq('user_id' , req.user.userId)
            .select();

        if (updateError) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to update transaction',
                error: updateError.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "Transaction updated successfully",
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
        const { pageNumber, rows } = req.body;
        const from = (pageNumber - 1) * rows;
        const to = from + rows - 1;

        const { data, error, count } = await supabase
            .from('transactions')
            .select(`*, 
                expense_type(
                expense_name
                )`, { count: 'exact' }
            )
            .eq('user_id' , req.user.userId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to fetch transactions',
                error: error.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "Transactions fetched successfully",
            data,
            total_count: count
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}

// exports.getById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const { data, error } = await supabase
//             .from('transactions')
//             .select('*')
//             .eq('id', id)
//             .single();

//         if (error || !data) {
//             return res.status(404).json({
//                 status: false,
//                 msg: 'Transaction not found'
//             });
//         }

//         res.status(200).json({
//             status: true,
//             msg: "Transaction fetched successfully",
//             data
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             msg: 'Internal server error',
//             error: error.message
//         });
//     }
// }

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: existingTransaction, error: findError } = await supabase
            .from('transactions')
            .select('*')
            .eq('transaction_id', id)
            .eq('user_id' , req.user.userId)
            .single();

        if (!existingTransaction) {
            return res.status(404).json({
                status: false,
                msg: 'Transaction not found'
            });
        }
        const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('transaction_id', id);

        if (deleteError) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to delete transaction',
                error: deleteError.message
            });
        }
        res.status(200).json({
            status: true,
            msg: "Transaction deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}
