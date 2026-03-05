import { useEffect, useState } from "react";
import type { Room } from "./RoomList.type";
import axiosInstance from "../../lib/axios";
import { useLocation, useNavigate } from "react-router";
import { useSocketContext } from "../../contexts/socket.context";
import { SOCKET_EVENT } from "../../constants/socket";

const RoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();
  const { current: socket } = useSocketContext();
  const { state: currentUser } = useLocation();

  useEffect(() => {
    (async () => {
      const response = await axiosInstance.get("/rooms");
      setRooms(response.data.data.rooms);
    })();

    socket?.emit(SOCKET_EVENT.CONNECT_USER, {
      userId: currentUser._id as string,
    });
  }, [socket, currentUser]);

  function joinRoom(roomId: string) {
    navigate(`/room/${roomId}`);
  }

  return (
    <>
      {rooms?.length > 0 &&
        rooms.map((room) => (
          <div key={room._id} onClick={() => joinRoom(room._id)}>
            {room._id} {room.roomName}
          </div>
        ))}
    </>
  );
};

export default RoomList;
