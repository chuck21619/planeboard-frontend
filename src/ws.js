let socket;
let onMessageHandler = null;

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
let intentionalDisconnect = false;

export function connectToRoom() {
  const username = localStorage.getItem("username");
  const roomId = localStorage.getItem("roomId");
  const deckUrl = localStorage.getItem("deckUrl");
  socket = new WebSocket(
    `${import.meta.env.VITE_WS_BASE_URL}/ws?room=${roomId}&username=${username}`
  );

  socket.onopen = () => {
    intentionalDisconnect = false;
    console.log("✅ WebSocket connected");
    socket.send(
      JSON.stringify({
        type: "JOIN",
        username,
        deckUrl,
      })
    );
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("📨 Message from server:", message);
    if (onMessageHandler) {
      onMessageHandler(message);
    }
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
    if (!intentionalDisconnect) {
      alert("Connection lost. Please refresh or try again later.");
    }
  };

  socket.onerror = (error) => {
    console.error("⚠️ WebSocket error:", error);
  };
}

export function sendMessage(msg) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("📤 Sending message:", msg);
    socket.send(JSON.stringify(msg));
  } else {
    console.warn("WebSocket not open");
  }
}

export function setOnMessageHandler(handler) {
  onMessageHandler = handler;
}

export function disconnect() {
  intentionalDisconnect = true;
  if (socket) socket.close();
}
