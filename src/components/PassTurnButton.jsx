export default function PassTurnButton({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#333",
        color: "white",
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        userSelect: "none",
        fontWeight: "bold",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      Pass Turn
    </div>
  );
}
