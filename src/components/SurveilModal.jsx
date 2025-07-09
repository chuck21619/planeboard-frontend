export default function SurveilModal({ deck, count, onClose }) {
  //const [query, setQuery] = useState("");
  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 100,
        background: "black",
        padding: 20,
      }}
    >
      <h3>
        Surveil {count} from {deck.id}
      </h3>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
