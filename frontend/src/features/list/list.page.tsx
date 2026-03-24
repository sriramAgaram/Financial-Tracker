import { useEffect, useState, lazy, Suspense, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux"
import { deleteTransactionActions, listTransactionActions } from "./redux/listSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import { selectDeleteSuccess, selectFilteredTotal, selectTotalCount, selectTransactionsList, selectUpdateSuccess } from "./redux/listSlice";
import { format, startOfMonth } from "date-fns";
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { useExpenseTypes } from "../../hooks/useExpenseTypes";

const EditSettingPopup = lazy(() => import("./components/EditListPopup.list").then(module => ({ default: module.EditSettingPopup })));

const ListPage = () => {
  const [pagenateData, setPagenateData] = useState({
    pageNumber: 1,
    rows: 5,
    totalRecords: 120
  });

  const getDefaultDateRange = useCallback(() => [startOfMonth(new Date()), new Date()], []);
  
  const [searchForm , setSearchForm] = useState<{category: any[], dateRange: any}>({
    category: [],
    dateRange: getDefaultDateRange()
  })

  const handleReset = () => {
    setSearchForm({
      category: [],
      dateRange: getDefaultDateRange()
    });
  };
  const updateSuccess = useAppSelector(selectUpdateSuccess);
  const deleteSuccess = useAppSelector(selectDeleteSuccess);

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const expenseTypes = useExpenseTypes() || []

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onPageChange = useCallback((e: any) => {
    setPagenateData((prev) => ({
      ...prev,
      pageNumber: e.page + 1,
      rows: e.rows
    }));
  }, []);

  const dispatch = useDispatch();
  const transactions = useAppSelector(selectTransactionsList);
  const totalCount = useAppSelector(selectTotalCount);
  const filteredTotal = useAppSelector(selectFilteredTotal);
  useEffect(() => {
    const payload: any = {
      ...pagenateData,
      category: searchForm.category
    };

    if (searchForm.dateRange?.[0] && searchForm.dateRange?.[1]) {
      payload.fromDate = searchForm.dateRange[0].toISOString().split('T')[0];
      payload.toDate = searchForm.dateRange[1].toISOString().split('T')[0];
    }

    dispatch(listTransactionActions.request(payload));
  }, [pagenateData , updateSuccess, deleteSuccess, searchForm])

  const paginatorTemplate = useMemo(() => isMobile 
    ? "PrevPageLink CurrentPageReport NextPageLink RowsPerPageDropdown"
    : "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport", [isMobile]);

  return (
    <div className="relative h-[calc(100vh-64px)] flex flex-col bg-slate-50/50">
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {selectedTransaction && (
          <Suspense fallback={null}>
            <EditSettingPopup 
                data={selectedTransaction} 
                visible={!!selectedTransaction} 
                setVisible={() => setSelectedTransaction(null)}
            />
          </Suspense>
        )}
        
        <div className="max-w-3xl mx-auto">
          
          {/* Dashboard Summary Header */}
          <div className="mb-8">
            <div className="max-w-md mx-auto bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spending</p>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    ₹{filteredTotal}
                  </h2>
                </div>
                <div className="bg-indigo-50 p-2.5 rounded-2xl">
                  <i className="pi pi-wallet text-indigo-500 text-xl font-bold"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
               {/* Date Filter */}
               <div className="w-full sm:w-1/2">
                <Calendar 
                    value={searchForm.dateRange} 
                    onChange={(e) => setSearchForm(prev => ({ ...prev, dateRange: e.value }))} 
                    selectionMode="range" 
                    readOnlyInput 
                    placeholder="Date Range"
                    className="w-full"
                    inputClassName="w-full h-11 pl-10 pr-4 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
                    showIcon={false}
                />
              </div>

               {/* Category Filter */}
               <div className="w-full sm:w-1/2">
                <MultiSelect 
                    value={searchForm.category} 
                    onChange={(e) => setSearchForm(prev => ({ ...prev , category: e.value}))} 
                    options={expenseTypes} 
                    filter={true}
                    filterDelay={300}
                    optionLabel="expense_name" 
                    optionValue="expense_type_id"
                    display="chip"
                    placeholder="All Categories" 
                    maxSelectedLabels={1} 
                    className="w-full" 
                    pt={{
                        root: { className: 'w-full h-11 border border-slate-200 rounded-xl hover:border-indigo-300 focus:border-indigo-400 transition-all shadow-sm bg-white overflow-hidden' },
                        label: { className: 'p-2.5 text-sm text-slate-700 font-medium' },
                        token: { className: 'bg-indigo-50 text-indigo-700 rounded-lg border-none' }
                    }}
                />
               </div>

               {/* Reset Button */}
               <div className="w-full sm:w-auto">
                 <Button 
                   icon="pi pi-refresh" 
                   label="Reset"
                   onClick={handleReset} 
                   className="w-full h-11 px-6 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm font-medium"
                 />
               </div>
            </div>
          </div>
          </div>

          <div className="space-y-4">
            {transactions?.map((item: any) => {
              const expenseType = expenseTypes.find((type: any) => type.expense_type_id === item.expense_type_id);
              const expenseName = expenseType ? expenseType.expense_name : 'Unknown';
              const date = item.date ? format(new Date(item.date), 'dd MMM, hh:mm a') : '';
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
                            <div className={`font-bold text-lg tracking-tight transition-colors ${item.transaction_type === 'CREDIT' ? 'text-emerald-600 group-hover:text-emerald-500' : 'text-slate-800 group-hover:text-rose-600'}`}>
                                {item.transaction_type === 'CREDIT' ? '+' : '-'} ₹{item.amount}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${item.transaction_type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {item.transaction_type === 'CREDIT' ? 'Credit' : 'Debit'}
                            </span>
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
                                    confirmDialog({
                                        message: `Are you sure you want to edit ${expenseName}?`,
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
                                        accept: () => dispatch(deleteTransactionActions.request({transaction_id: item.transaction_id}))
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


      {/* Fixed Paginator Footer */}
      <div className="fixed bottom-0 right-0 left-0 sm:left-64 z-20 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6
       shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="max-w-3xl mx-auto flex justify-center w-full">
            <Paginator
            first={(pagenateData.pageNumber - 1) * pagenateData.rows}
            rows={pagenateData.rows}
            totalRecords={totalCount}
            rowsPerPageOptions={[5, 10, 20]}
            onPageChange={onPageChange}
            className="bg-transparent border-none p-0 w-full"
            template={paginatorTemplate}
            currentPageReportTemplate="{first} - {last} of {totalRecords}"
            />
        </div>
      </div>
    </div>
  )
}

export default ListPage