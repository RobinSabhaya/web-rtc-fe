import { createBrowserRouter } from "react-router";
import Room from "./components/room/Room";
import RoomList from "./components/room/RoomList";
import Auth from "./components/auth/Auth";

export default createBrowserRouter([
  {
    path: "/",
    Component: Auth,
    index: true,
  },
  {
    path: "/rooms",
    Component: RoomList,
  },
  {
    path: "/room/:roomId",
    Component: Room,
  },
]);
