import { useNavigate } from "react-router";

const RoomList = () => {
  // const [rooms, setRooms] = useState<Room[]>([{
  //   _id: '1234',
  //   roomName: 'test'
  // }]);
  const rooms = [
    {
      _id: "AI",
      roomName: "AI",
    },
  ];
  const navigate = useNavigate();

  // useEffect(() => {
  //   (async () => {
  //     const response = await axiosInstance.get("/rooms");
  //     setRooms(response.data.data.rooms);
  //   })();
  // }, [socket, currentUser]);

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
