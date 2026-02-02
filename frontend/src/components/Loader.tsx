import { ProgressSpinner } from 'primereact/progressspinner';

const Loader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <ProgressSpinner strokeWidth="5" />
        </div>
    );
};

export default Loader;
