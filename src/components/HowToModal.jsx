export default function HowToModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>How to Use Planeboard</h2>
        <p>
          Enter a username and a room name to create or join a room. Paste an
          Archidekt deck URL to load your deck into the room.
        </p>

        <h3>FAQ</h3>

        <p>
          <strong>How do I draw?</strong>
          <br />
          Click your deck.
        </p>

        <p>
          <strong>How do I play a card?</strong>
          <br />
          Drag card from your hand onto the battlefield.
        </p>

        <p>
          <strong>How do I put a card back into library?</strong>
          <br />
          Drag card onto the top of the library.
        </p>

        <p>
          <strong>How do I put a card back into hand?</strong>
          <br />
          Drag card into hand.
        </p>

        <p>
          <strong>How do I make tokens?</strong>
          <br />
          Right click on card that makes tokens.
        </p>

        <p>
          <strong>How do I flip cards?</strong>
          <br />
          Press 'f' while hovering over a card on the battlefield. You can also
          flip a card while dragging by pressing 'f'.
        </p>

        <p>
          <strong>How do I add counters?</strong>
          <br />
          Right click on the battlefield.
        </p>

        <p>
          <strong>How do I delete counters?</strong>
          <br />
          Press 'd' while hovering over counter.
        </p>

        <p>
          <strong>How do I roll dice?</strong>
          <br />
          Right click on the battlefield.
        </p>

        <p>
          <strong>How do I delete dice?</strong>
          <br />
          Press 'd' while hovering over dice.
        </p>

        <p>
          <strong>How do I search a library?</strong>
          <br />
          Right click on deck. Drag card onto battlefield or hand.
        </p>

        <p>
          <strong>How do I spectate?</strong>
          <br />
          Leave archidekt field blank when joining. Or join a room that already
          has 4 players.
        </p>

        <p>
          <strong>How do I report a bug or request a feature?</strong>
          <br />
          Click the exclamation button at the bottom left of the login screen.
        </p>

        <p>
          <strong>
            Why am I not seeing the tokens when right clicking a card?
          </strong>
          <br />
          There are two main reasons this can happen:
          <br />
          1) The archidekt api did not provide token information for the card
          <br />
          2) The token data for the card is still loading
        </p>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
