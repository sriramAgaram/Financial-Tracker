import { useAppSelector } from "../hooks/useAppSelector";
import { selectIsLoading as selectAuthLoading } from "../features/auth/redux/authSlice";
import { selectIsLoading as selectHomeLoading } from "../features/home/redux/homeSlice";
import { selectLoading as selectListLoading } from "../features/list/redux/listSlice";
import Loader from "./Loader";
import { selectDashboardLoading } from "../features/Dashboard/redux/dashboard.slice";

const GlobalLoader = () => {
    const isAuthLoading = useAppSelector(selectAuthLoading);
    const isHomeLoading = useAppSelector(selectHomeLoading);
    const isListLoading = useAppSelector(selectListLoading);
    const isDashboardLoading = useAppSelector(selectDashboardLoading)

    const isLoading = isAuthLoading || isHomeLoading || isListLoading || isDashboardLoading;

    if (!isLoading) return null;

    return <Loader />;
};

export default GlobalLoader;
