import type { PlayerId } from "../game/types";

type ResultModalProps = {
  winner: PlayerId | "draw";
  onReset: () => void;
  onTitle: () => void;
};

export function ResultModal({ winner, onReset, onTitle }: ResultModalProps) {
  const label = winner === "player" ? "WIN!" : winner === "cpu" ? "LOSE..." : "DRAW!";

  return (
    <div className="modal-backdrop">
      <section className="result-modal" role="dialog" aria-modal="true" aria-label="勝敗">
        <div className={`result-word result-${winner}`}>{label}</div>
        <p>
          {winner === "player" && "CPUの両手をDOWN！あなたの勝ちです。"}
          {winner === "cpu" && "あなたの両手がDOWNしました。もう一回！"}
          {winner === "draw" && "長期戦につき引き分けです。"}
        </p>
        <div className="result-actions">
          <button className="bevel-button red-button" type="button" onClick={onReset}>もう一度</button>
          <button className="bevel-button blue-button" type="button" onClick={onTitle}>タイトルへ</button>
        </div>
      </section>
    </div>
  );
}
