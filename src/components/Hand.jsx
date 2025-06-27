export default function Hand({ hand }) {
  return (
    <div className="hand-container">
      {hand.map((card, index) => (
        <div key={index} className="card-in-hand">
          <img src={card.imageUrl} alt={card.name} />
        </div>
      ))}
    </div>
  );
}
