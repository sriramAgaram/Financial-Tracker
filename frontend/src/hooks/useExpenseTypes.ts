import { useDispatch } from "react-redux"
import { useAppSelector } from "./useAppSelector";
import { selectExpenseTypes, selectError, selectIsLoading } from "../features/home/redux/homeSlice";
import { useEffect } from "react";
import { expenseTypeActions } from "../features/home/redux/homeSagas";

export const useExpenseTypes = () => {
    const dispatch = useDispatch();
    const expenseTypes = useAppSelector(selectExpenseTypes);
    const error = useAppSelector(selectError);
    const isLoading = useAppSelector(selectIsLoading);
    useEffect(() => {
        if (expenseTypes.length === 0 && !error && !isLoading) {
            dispatch(expenseTypeActions.request())
        }
    }, [dispatch, expenseTypes.length, error, isLoading])

    return expenseTypes;
}