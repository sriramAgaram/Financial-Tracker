import * as Yup from 'yup';

export const settingsSchema = Yup.object().shape({
    daily_limit: Yup.number()
        .required('Daily limit is required')
        .positive('Daily limit must be positive')
        .typeError('Daily limit must be a number'),
    monthly_limit: Yup.number()
        .required('Monthly limit is required')
        .positive('Monthly limit must be positive')
        .min(Yup.ref('daily_limit'), 'Monthly limit must be greater than or equal to daily limit')
        .typeError('Monthly limit must be a number'),
    overall_amount: Yup.number()
        .required('Overall amount is required')
        .positive('Overall amount must be positive')
        .typeError('Overall amount must be a number')
});
