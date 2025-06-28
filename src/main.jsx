import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Room from "./components/Room/Room.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/room/:roomId" element={<Room />} />
      <Route path="*" element={<Login />} />
    </Routes>
  </BrowserRouter>
);
