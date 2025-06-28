export default function PlayerBars({ positions }) {
  return (
    <>
      <div className="player-bar player-bar-top">
        <div className="player-half">
          {Object.entries(positions).find(([_, pos]) => pos === "topLeft")?.[0]}
        </div>
        <div className="player-half">
          {
            Object.entries(positions).find(
              ([_, pos]) => pos === "topRight"
            )?.[0]
          }
        </div>
      </div>
      <div className="player-bar player-bar-bottom">
        <div className="player-half">
          {
            Object.entries(positions).find(
              ([_, pos]) => pos === "bottomLeft"
            )?.[0]
          }
        </div>
        <div className="player-half">
          {
            Object.entries(positions).find(
              ([_, pos]) => pos === "bottomRight"
            )?.[0]
          }
        </div>
      </div>
    </>
  );
}
