let socket;

export function connectToRoom(roomId = "1234") {
  socket = new WebSocket(`ws://localhost:8080/ws?room=${roomId}`);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
    // Send a test message
    socket.send(JSON.stringify({ type: "JOIN", user: "Player1" }));
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("📨 Message from server:", message);
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
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
