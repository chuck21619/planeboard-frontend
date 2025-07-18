import { useNavigate } from "react-router-dom";
import { useState } from "react";
import HowToModal from "./components/HowToModal";
import ReportModal from "./components/ReportModal";

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
  const [spectator, setSpectator] = useState(() => {
    const stored = localStorage.getItem("spectator");
    return stored === "true";
  });
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);
    localStorage.setItem("deckUrl", deckUrl);
    localStorage.setItem("spectator", spectator.toString());
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
          onChange={(e) => {
            setSpectator(!e.target.value);
            setDeckUrl(e.target.value);
          }}
          placeholder="Archidekt URL"
          className="login-input"
        />
        <br />
        <button
          onClick={handleJoinRoom}
          disabled={!username.trim() || !roomId.trim()}
        >
          Join Room
        </button>
        <button onClick={() => setShowHelpModal(true)} className="help-button">
          ?
        </button>
        <button
          onClick={() => setShowReportModal(true)}
          className="report-button"
        >
          !
        </button>
      </div>

      {showHelpModal && <HowToModal onClose={() => setShowHelpModal(false)} />}
      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}
