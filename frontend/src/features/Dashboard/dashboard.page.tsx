import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format, subDays } from "date-fns";
import Barchart from "./components/Barchart.tsx";
import { weeklyDataActions } from "./redux/dashboard.saga.ts";
import { selectWeeklyData } from "./redux/dashboard.slice.ts";

const DashboardPage = () => {
    const dispatch = useDispatch();
    const weeklyData = useSelector(selectWeeklyData);
    useEffect(() => {
        const toDate = format(new Date(), "yyyy-MM-dd");
        const fromDate = format(subDays(new Date(), 7), "yyyy-MM-dd");

        dispatch(weeklyDataActions.request({ fromDate, toDate }));
    }, [dispatch]);

    const ChartData = useMemo(() => weeklyData?.chartData || [], [weeklyData?.chartData]);
    const Labels = useMemo(() => weeklyData?.labels || [], [weeklyData?.labels]);
    const overExpenseChartData = useMemo(() => weeklyData?.overExpenseChartData || [], [weeklyData?.overExpenseChartData]);
    const overExpenseLabels = useMemo(() => weeklyData?.overExpenseLabels || [], [weeklyData?.overExpenseLabels]);



    return (
        <div>
                <Barchart 
                    chartData={ChartData} 
                    labels={Labels}
                    overExpenseChartData={overExpenseChartData}
                    overExpenseLabels = {overExpenseLabels}
                />
        </div>
    );
};

export default DashboardPage;