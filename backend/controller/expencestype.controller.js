const supabase = require("../config/supabase.js")
const expenseModel = require("../models/expense.model.js")

exports.add = async (req, res) => {
    try {
        let userInput = req.body;
        userInput['user_id'] =req.user.userId;

        const createData = expenseModel.getExpenseTypeForCreate(userInput);

        const { data: existingType, error: checkError } = await supabase
            .from('expense_type')
            .select('*')
            .eq("expense_name", createData.expense_name)
            .eq("user_id", createData.user_id)
            .single();

        if (existingType) {
            return res.status(400).json({ status: false, msg: 'The Expense Type already exists' });
        }

        const { data, error: insertError } = await supabase
            .from('expense_type')
            .insert([createData])
            .select();

        if (insertError) {
            return res.status(500).json({ status: false, msg: 'Failed to create expense type', error: insertError });
        }

        res.status(201).json({ status: true, msg: "Expense Type created successfully", data });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error });
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;
        updateData['user_id'] = req.user.userId

        // Pick only allowed fields for update
        const updateFields = expenseModel.getExpenseTypeForUpdate(updateData);

        const { data: existingType, error: findError } = await supabase
            .from('expense_type')
            .select('*')
            .eq('expense_type_id', id)
            .eq('user_id' , updateData.user_id)
            .single();

        if (!existingType) {
            return res.status(404).json({ status: false, msg: 'Expense Type not found' });
        }
        if (updateFields.expense_name) {
            const { data: conflictingType, error: conflictError } = await supabase
                .from('expense_type')
                .select('*')
                .eq('expense_name', updateFields.expense_name)
                .eq('user_id', req.user.userId)
                .neq('expense_type_id', id)
                .single();

            if (conflictingType) {
                return res.status(400).json({ status: false, msg: 'Another Expense Type with this name already exists' });
            }
        }
        const { data, error: updateError } = await supabase
            .from('expense_type')
            .update(updateFields)
            .eq('expense_type_id', id)
            .select();

        if (updateError) {
            return res.status(500).json({ status: false, msg: 'Failed to update expense type', error: updateError });
        }

        res.status(200).json({ status: true, msg: "Expense Type updated successfully", data });
    } catch (error) {
        console.error('Internal server Error', error)
        res.status(500).json({ status: false, msg: 'Internal Server Error', error });
    }
}

exports.lists = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('expense_type')
            .select('*')
            .eq('user_id',req.user.userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ status: false, msg: 'Failed to fetch expense types', error });
        }

        res.status(200).json({ status: true, msg: "Expense Types fetched successfully", data });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error });
    }
}

// exports.getById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const { data, error } = await supabase
//             .from('expense_type')
//             .select('*')
//             .eq('expense_type_id', id)
//             .single();

//         if (error || !data) {
//             return res.status(404).json({ status: false, msg: 'Expense Type not found' });
//         }

//         res.status(200).json({ status: true, msg: "Expense Type fetched successfully", data });
//     } catch (error) {
//         res.status(500).json({ status: false, msg: 'Internal Server Error', error });
//     }
// }

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: existingType, error: findError } = await supabase
            .from('expense_type')
            .select('*')
            .eq('expense_type_id', id)
            .single();

        if (!existingType) {
            return res.status(404).json({ status: false, msg: 'Expense Type not found' });
        }
        const { error: deleteError } = await supabase
            .from('expense_type')
            .delete()
            .eq('expense_type_id', id);
        if (deleteError) {
            return res.status(500).json({ status: false, msg: 'Failed to delete expense type', error: deleteError });
        }
        res.status(200).json({ status: true, msg: "Expense Type deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: false, msg: 'Internal Server Error', error });
    }
}
