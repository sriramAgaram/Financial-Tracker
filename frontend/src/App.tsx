import Routes from "./routes"
import GlobalLoader from "./components/GlobalLoader";
import GlobalToast from "./components/GlobalToast";

const App = () => {
  return (
    <div>
      <GlobalLoader />
      <GlobalToast />
      <Routes />
    </div>
  )
}

export default App
