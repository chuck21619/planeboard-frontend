export default function SurveilModal({ deckId, count, onClose }) {
  //const [query, setQuery] = useState("");
  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 100,
        background: "white",
        padding: 20,
      }}
    >
      <h3>
        Surveil {count} from {deckId}
      </h3>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
