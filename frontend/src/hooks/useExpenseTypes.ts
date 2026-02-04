import { useDispatch } from "react-redux"
import { useAppSelector } from "./useAppSelector";
import { selectExpenseTypes } from "../features/home/redux/homeSlice";
import { useEffect } from "react";
import { expenseTypeActions } from "../features/home/redux/homeSagas";

export const useExpenseTypes = () => {
    const dispatch = useDispatch();
    const expenseTypes = useAppSelector(selectExpenseTypes);

    useEffect(()=>{
       if(expenseTypes?.length === 0){
        dispatch(expenseTypeActions.request())
       }
    },[dispatch,expenseTypes])

    return expenseTypes;

}