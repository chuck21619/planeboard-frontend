import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("1234");
  const [deckUrl, setDeckUrl] = useState("");

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      const params = new URLSearchParams({ deck: deckUrl.trim() });
      navigate(`/room/${roomId.trim()}?${params.toString()}`);
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
        style={{ padding: "0.5rem", fontSize: "1rem", width: "300px" }}
      />
      <br />
      <br />
      <input
        type="text"
        value={deckUrl}
        onChange={(e) => setDeckUrl(e.target.value)}
        placeholder="Paste Archidekt deck URL"
        style={{ padding: "0.5rem", fontSize: "1rem", width: "300px" }}
      />
      <br />
      <br />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}
