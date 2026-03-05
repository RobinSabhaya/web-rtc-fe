import { RouterProvider } from "react-router-dom";
import router from "./routes";
import SocketProvider from "./contexts/SocketProvider";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <SocketProvider>
        {/* For toaster */}
        <Toaster />
        <RouterProvider router={router} />
      </SocketProvider>
    </>
  );
};

export default App;
