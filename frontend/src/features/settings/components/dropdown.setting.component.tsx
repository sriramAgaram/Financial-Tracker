import React, { useState } from "react";
import { Dropdown } from 'primereact/dropdown';
import { Button } from "primereact/button";
import { useDispatch } from "react-redux";
import { deleteExpenseTypeActions, addExpenseTypeActions } from "../../home/redux/homeSagas";
import { SettingDialog } from "./dialog.setting.component";
import { confirmDialog } from 'primereact/confirmdialog';
import { InputText } from "primereact/inputtext";
import { useExpenseTypes } from "../../../hooks/useExpenseTypes";


export default function DropdownSettingComponent() {
    const [data, setData] = useState('');
    const [editName, setEditName] = useState('');
    const [addName, setAddName] = useState('');
    const [visible, setVisible] = useState(false)
    const expenstTypeOptions = useExpenseTypes();
    const dispatch = useDispatch();



    const handelEdit = (e: React.MouseEvent, option: any) => {
        e.stopPropagation();
        setVisible(true);
        setEditName(option)
    }

    const handleDelete = (e: React.MouseEvent, option: any) => {
        e.stopPropagation();
        confirmDialog({
            message: `Are you sure you want to delete ${option.expense_name}?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => dispatch(deleteExpenseTypeActions.request(option.expense_type_id))
        });
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!addName.trim()) return;
        dispatch(addExpenseTypeActions.request({ expense_name: addName }))
        setAddName(''); 
    }


    const selectedTypeTemplate = (option: any, props: any) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.expense_name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const typeOptionTemplate = (option: any) => {
        return (
            <div className="flex items-center justify-between w-full px-2 py-1 group">
                <div className="font-medium text-gray-700 truncate max-w-[150px] md:max-w-xs" title={option.expense_name}>{option.expense_name}</div>
                <div className="flex gap-2">
                    <Button
                        icon="pi pi-pencil"
                        rounded
                        text
                        className="w-8 h-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={(e) => handelEdit(e, option)}
                        tooltip="Edit"
                        tooltipOptions={{ position: 'top' }}
                    />
                    <Button
                        icon="pi pi-trash"
                        rounded
                        text
                        className="w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleDelete(e, option)}
                        tooltip="Delete"
                        tooltipOptions={{ position: 'top' }}
                    />
                </div>
            </div>
        );
    };
    return (

        <div className="card flex flex-col gap-4 w-full">
            <div className="flex justify-content-center w-full">
                <Dropdown
                    value={data}
                    onChange={(e) => setData(e.value)}
                    options={expenstTypeOptions}
                    optionLabel="expense_name"
                    placeholder="Select an Expense Type"
                    filter
                    filterDelay={400}
                    valueTemplate={selectedTypeTemplate}
                    itemTemplate={typeOptionTemplate}
                    className="w-full"
                    panelClassName="w-full max-w-[90vw] md:max-w-full"
                />
            </div>

            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3 w-full">
                <InputText
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="Add New Expense Type"
                    className="w-full md:flex-1"
                />
                <Button
                    label="Add"
                    icon="pi pi-plus"
                    type="submit"
                    className="w-full md:w-auto px-6 whitespace-nowrap"
                />
            </form>


            <SettingDialog visible={visible} setvisible={setVisible} data={editName} />
        </div>


    )
}

