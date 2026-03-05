import Routes from "./routes"
import GlobalLoader from "./components/GlobalLoader";
import GlobalToast from "./components/GlobalToast";
import { ConfirmDialog } from 'primereact/confirmdialog';

const App = () => {
  return (
    <div>
      <GlobalLoader />
      <GlobalToast />
      <ConfirmDialog />
      <Routes />
    </div>
  )
}

export default App
