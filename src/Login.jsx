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
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);
    localStorage.setItem("deckUrl", deckUrl);
    setIsFadingOut(true);
    setTimeout(() => {
      navigate(`/room/${roomId}`);
    }, 200);
  };

  return (
    <div className={`fade-in ${!isFadingOut ? "show" : ""}`}>
      <div className="login-wrapper">
        <h1>Planeboard</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room Name"
          className="login-input"
        />
        <input
          type="text"
          value={deckUrl}
          onChange={(e) => setDeckUrl(e.target.value)}
          placeholder="Archidekt URL"
          className="login-input"
        />
        <br />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
}
