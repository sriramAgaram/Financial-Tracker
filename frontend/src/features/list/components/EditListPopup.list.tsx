import { Dialog } from "primereact/dialog";
import { useState, useEffect } from "react";
import { useExpenseTypes } from "../../../hooks/useExpenseTypes";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { updateTransactionActions } from "../redux/listSagas";
import { Button } from "primereact/button";

export const EditSettingPopup = ({ data, visible, setVisible }: any) => {

    const [formData, setFormData] = useState({
        amount: data?.amount || 0,
        expense_type_id: data?.expense_type_id || null,

    })

    const expencesTypes = useExpenseTypes();

    const dispatch = useDispatch();

    const handleUpdate = () => {
        if (!data?.transaction_id) return;
        
        dispatch(updateTransactionActions.request({
            amount: Number(formData.amount),
            expense_type_id: formData.expense_type_id,
            transaction_id: data.transaction_id
        }))
        setVisible(false);
    }

    useEffect(() => {
        if (data) {
            setFormData({
                amount: data?.amount,
                expense_type_id: data?.expense_type_id
            })
        }
    }, [data])

    return (
        <div>
            <Dialog header="Edit Transaction" visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }}>
                <div className="flex flex-col gap-4 w-full">
                    <Dropdown
                        value={formData.expense_type_id}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            expense_type_id: e.value
                        }))}
                        options={expencesTypes}
                        optionLabel="expense_name"
                        optionValue="expense_type_id"
                        placeholder="Select an Expense Type"
                        filter
                        filterDelay={400}
                        className="w-full"
                    />
                    <InputText
                        value={formData.amount.toString()}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            amount: e.target.value
                        }))}
                        placeholder="Amount"
                        keyfilter="num"
                        className="w-full"
                    />

                    <Button 
                        label="Update" 
                        icon="pi pi-check" 
                        onClick={handleUpdate}
                        disabled={!formData.expense_type_id || !formData.amount}
                    />
                </div>

            </Dialog>
        </div>
    )
}