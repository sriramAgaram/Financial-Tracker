import { useEffect } from "react";
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

    return (
        <div>
            <h1>Dashboard</h1>
            {weeklyData ? (
                <Barchart 
                    chartData={weeklyData.chartData} 
                    labels={weeklyData.labels}
                />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default DashboardPage;