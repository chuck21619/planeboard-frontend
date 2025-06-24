import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("1234");

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome, {localStorage.getItem("username")}</h1>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter room ID"
        style={{ padding: "0.5rem", fontSize: "1rem" }}
      />
      <br />
      <br />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}
