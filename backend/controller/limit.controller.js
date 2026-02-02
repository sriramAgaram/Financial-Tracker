const supabase = require("../config/supabase.js");
const limitModel = require("../models/limit.model.js");

exports.add = async (req, res) => {
    try {
        const userInput = req.body;
        userInput['user_id'] = req.user.userId

        // Pick only required fields for creation
        const createData = limitModel.getLimitForCreate(userInput);

        if (!createData.daily_limit || !createData.user_id) {
            return res.status(400).json({
                status: false,
                msg: 'Missing required fields: daily_limit, user_id'
            });
        }

        const { data, error } = await supabase
            .from('amount_limit')
            .insert([createData])
            .select();

        if (error) {
            // Handle unique constraint violation
            if (error.code === '23505') {
                return res.status(400).json({
                    status: false,
                    msg: 'User already has a limit set. Use update instead.'
                });
            }
            return res.status(500).json({
                status: false,
                msg: 'Failed to create limit',
                error: error.message
            });
        }

        res.status(201).json({
            status: true,
            msg: 'Limit created successfully',
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
        updateData['user_id'] = req.user.userId

        // Pick only allowed fields for update
        const updateFields = limitModel.getLimitForUpdate(updateData);

        // Check if limit exists
        const { data: existingLimit, error: findError } = await supabase
            .from('amount_limit')
            .select('*')
            .eq('limit_id', id)
            .eq('user_id', req.user.userId)
            .single();

        if (!existingLimit) {
            return res.status(404).json({
                status: false,
                msg: 'Limit not found'
            });
        }

        // Update the limit
        const { data, error: updateError } = await supabase
            .from('amount_limit')
            .update(updateFields)
            .eq('limit_id', id)
            .select();

        if (updateError) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to update limit',
                error: updateError.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "Limit updated successfully",
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

exports.getAll = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('amount_limit')
            .select('*').eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to fetch limits',
                error: error.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "Limits fetched successfully",
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

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('amount_limit')
            .select('*')
            .eq('limit_id', id)
            .eq('user_id', req.user.userId)
            .single();

        if (error || !data) {
            return res.status(404).json({
                status: false,
                msg: 'Limit not found'
            });
        }

        res.status(200).json({
            status: true,
            msg: "Limit fetched successfully",
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

exports.getByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('amount_limit')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to fetch user limits',
                error: error.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "User limits fetched successfully",
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

        // Check if limit exists
        const { data: existingLimit, error: findError } = await supabase
            .from('amount_limit')
            .select('*')
            .eq('limit_id', id)
            .eq('user_id', req.user.userId)
            .single();

        if (!existingLimit) {
            return res.status(404).json({
                status: false,
                msg: 'Limit not found'
            });
        }

        // Delete the limit
        const { error: deleteError } = await supabase
            .from('amount_limit')
            .delete()
            .eq('limit_id', id);

        if (deleteError) {
            return res.status(500).json({
                status: false,
                msg: 'Failed to delete limit',
                error: deleteError.message
            });
        }

        res.status(200).json({
            status: true,
            msg: "Limit deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
}
