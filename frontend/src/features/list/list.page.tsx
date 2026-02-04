import { useEffect, useState } from "react";
import { useDispatch } from "react-redux"
import { listTransactionActions } from "./redux/listSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import { selectTotalCount, selectTransactionsList } from "./redux/listSlice";
import { format } from "date-fns";
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { EditSettingPopup } from "./components/EditListPopup.list";

const ListPage = () => {
  const [pagenateData, setPagenateDate] = useState({
    pageNumber: 1,
    rows: 5,
    totalRecords: 120
  });

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const onPageChange = (e:any) => {
    setPagenateDate({
      ...pagenateData,
      pageNumber:e.page +1,
      rows:e.rows
    })
  }
  const dispatch = useDispatch();
  const transactions = useAppSelector(selectTransactionsList);
  const totalCount = useAppSelector(selectTotalCount)

  useEffect(() => {
    dispatch(listTransactionActions.request(pagenateData));
  }, [pagenateData])
  return (
    <div className="relative h-[calc(100vh-64px)] flex flex-col bg-slate-50/50">
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <ConfirmDialog />
        <EditSettingPopup 
            data={selectedTransaction} 
            visible={!!selectedTransaction} 
            setVisible={() => setSelectedTransaction(null)}
        />
        
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Transactions</h2>
             <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                Total: {totalCount}
             </span>
          </div>

          <div className="space-y-4">
            {transactions?.map((item: any) => {
              const expenseName = item.expense_type?.expense_name || 'Unknown';
              const date = item.created_at ? format(new Date(item.created_at), 'dd MMM, hh:mm a') : '';
              const initial = expenseName.charAt(0).toUpperCase();

              return (
                <div key={item.transaction_id} className="group relative bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon Circle */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner group-hover:from-indigo-100 group-hover:to-indigo-50 transition-all">
                        {initial}
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="font-semibold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">{expenseName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <i className="pi pi-calendar text-xs text-slate-400"></i>
                            <span className="text-slate-500 text-xs font-medium">{date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <div className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-red-600 transition-colors">
                                - ₹{item.amount.toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Debit</span>
                        </div>

                        {/* Action Buttons - Always Visible now */}
                        <div className="flex gap-1">
                             <Button 
                                icon="pi pi-pencil" 
                                rounded 
                                text 
                                severity="warning"
                                aria-label="Edit"
                                className="w-8 h-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(item)
                                    confirmDialog({
                                        message: `Are you sure you want to edit ${item.expense_name}?`,
                                        header: 'Edit Confirmation',
                                        icon: 'pi pi-exclamation-triangle',
                                        acceptClassName: 'p-button-warning',
                                        accept: () => setSelectedTransaction(item) 
                                    });
                                }}
                            />
                             <Button 
                                icon="pi pi-trash" 
                                rounded 
                                text 
                                severity="danger" 
                                aria-label="Delete"
                                className="w-8 h-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDialog({
                                        message: 'Do you want to delete this record?',
                                        header: 'Delete Confirmation',
                                        icon: 'pi pi-info-circle',
                                        defaultFocus: 'reject',
                                        acceptClassName: 'p-button-danger',
                                        accept: () => {
                                            console.log('Delete confirmed', item);
                                        }
                                    });
                                }}
                            />
                        </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>


      {/* Fixed Paginator Footer */}
      <div className="fixed bottom-0 right-0 left-0 sm:left-64 z-20 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="max-w-3xl mx-auto flex justify-center w-full">
            <Paginator
            first={(pagenateData.pageNumber - 1) * pagenateData.rows}
            rows={pagenateData.rows}
            totalRecords={totalCount}
            rowsPerPageOptions={[5, 10, 20]}
            onPageChange={onPageChange}
            className="bg-transparent border-none p-0 w-full"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="{first} - {last} of {totalRecords}"
            />
        </div>
      </div>
    </div>
  )
}

export default ListPage