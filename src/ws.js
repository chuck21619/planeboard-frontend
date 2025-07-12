let socket = null;
let onMessageHandler = null;
const HTTP_BASE_URL = import.meta.env.VITE_HTTP_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
let intentionalDisconnect = false;

async function waitForHealth(retries = 10, delay = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${HTTP_BASE_URL}/health`, { cache: "no-store" });
      if (res.ok) return;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Backend health check failed after retries");
}

export async function connectToRoom() {
  const username = localStorage.getItem("username");
  const roomId = localStorage.getItem("roomId");
  const deckUrl = localStorage.getItem("deckUrl");

  try {
    await waitForHealth();

    socket = new WebSocket(
      `${WS_BASE_URL.replace(
        /^http/,
        "ws"
      )}/ws?room=${roomId}&username=${username}`
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
  } catch (err) {
    console.error("🛑 Failed to connect:", err);
    alert("Backend is not available. Please try again in a moment.");
  }
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
