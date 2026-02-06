import { useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectToast, hideToast } from '../store/uiSlice';

const GlobalToast = () => {
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch();
    const toastState = useAppSelector(selectToast);

    useEffect(() => {
        if (toastState && toast.current) {
            toast.current.show({
                severity: toastState.severity,
                summary: toastState.summary,
                detail: toastState.detail,
                life: toastState.life || 3000
            });
            // Reset state immediately so strict mode/future updates work if exact same toast is sent again
             dispatch(hideToast());
        }
    }, [toastState, dispatch]);

    return <Toast ref={toast} position="top-right" className="w-full max-w-[90vw] sm:max-w-100 left-[5vw] sm:left-auto" />;
};

export default GlobalToast;
