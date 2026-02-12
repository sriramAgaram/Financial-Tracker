
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog as PrimengDialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { useDispatch } from "react-redux";
import { updateExpenseTypeActions } from "../../home/redux/homeSagas";
import { showToast } from "../../../store/uiSlice";


export const SettingDialog = ({ visible, data, setvisible }: { visible: boolean, data: any, setvisible: (visible: boolean) => void }) => {
    const [value, setValue] = useState(data);
    const dispatch = useDispatch();

    useEffect(() => {
        setValue(data);
    }, [data]);

    const handleSave = () => {
        if (value?.expense_type_id) {
            dispatch(updateExpenseTypeActions.request({ id: value.expense_type_id, name: value.expense_name }));
            setvisible(false);
        }

    };

    const footerContent = (
        <div className="flex justify-end gap-2 pt-4">
            <Button label="Cancel" icon="pi pi-times" text onClick={() => setvisible(false)} className="p-button-secondary" />
            <Button label="Save" icon="pi pi-check" onClick={handleSave} autoFocus />
        </div>
    );

    return (
        <PrimengDialog 
            header="Update the name of this expense category" 
            visible={visible} 
            style={{ width: '400px' }} 
            onHide={() => setvisible(false)}
            footer={footerContent}
            className="p-fluid"
        >
            <div className="py-6">
                <FloatLabel>
                    <InputText 
                        id="ExpenceName" 
                        value={value?.expense_name || ''} 
                        onChange={(e) => setValue({ ...value, expense_name: e.target.value })} 
                        className="w-full"
                    />
                    <label htmlFor="ExpenceName">Expense Name</label>
                </FloatLabel>
            </div>
        </PrimengDialog>
    );
};