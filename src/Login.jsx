import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || ""
  );
  const [roomId, setRoomId] = useState(
    () => localStorage.getItem("roomId") || ""
  );
  const [deckUrl, setDeckUrl] = useState(
    () => localStorage.getItem("deckUrl") || ""
  );
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    const deckUrl = localStorage.getItem("deckUrl");
    const deckId = deckUrl.split("/").pop();

    const res = await fetch(
      `https://archidekt.com/api/decks/${deckId}/export/compact/`
    );
    const data = await res.json();
    console.log(data);

    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);
    localStorage.setItem("deckUrl", deckUrl);
    //localStorage.setItem("cards", JSON.stringify(cards));
    navigate(`/room/${roomId}`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Planeboard</h1>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "0.5rem", fontSize: "1rem", width: "300px" }}
      />
      <br />
      <br />
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room Name"
        style={{ padding: "0.5rem", fontSize: "1rem", width: "300px" }}
      />
      <br />
      <br />
      <input
        type="text"
        value={deckUrl}
        onChange={(e) => setDeckUrl(e.target.value)}
        placeholder="Archidekt URL"
        style={{ padding: "0.5rem", fontSize: "1rem", width: "300px" }}
      />
      <br />
      <br />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}
