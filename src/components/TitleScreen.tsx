import type { CpuLevel } from "../game/types";

type TitleScreenProps = {
  cpuLevel: CpuLevel;
  onCpuLevelChange: (level: CpuLevel) => void;
  onStartBattle: () => void;
  onStartPuzzle: () => void;
  onShowRules: () => void;
};

const CPU_LEVELS: Array<{ value: CpuLevel; label: string; note: string }> = [
  { value: "easy", label: "よわい", note: "ランダム" },
  { value: "normal", label: "ふつう", note: "おすすめ" },
  { value: "hard", label: "つよい", note: "ちょい賢い" },
];

export function TitleScreen({ cpuLevel, onCpuLevelChange, onStartBattle, onStartPuzzle, onShowRules }: TitleScreenProps) {
  return (
    <main className="app-shell title-shell">
      <div className="star star-a">★</div>
      <div className="star star-b">★</div>
      <div className="star star-c">★</div>

      <section className="title-hero">
        <div className="burst">5以上で<br />死ぬ派</div>
        <h1 className="game-logo">割り箸バトル</h1>
        <p className="subtitle">なつかし指遊びゲーム</p>
      </section>

      <p className="lead-copy">
        小学生のころやった、あの指遊びを1人で。<br />
        CPUと対戦したり、詰め問題に挑戦しよう！
      </p>

      <section className="cpu-level-panel" aria-label="CPUレベル">
        <h2>CPUレベル</h2>
        <div className="cpu-level-buttons">
          {CPU_LEVELS.map((level) => (
            <button
              className={`level-button ${cpuLevel === level.value ? "is-active" : ""}`}
              type="button"
              key={level.value}
              onClick={() => onCpuLevelChange(level.value)}
            >
              <strong>{level.label}</strong>
              <small>{level.note}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="title-actions">
        <button className="mega-button red-button" type="button" onClick={onStartBattle}>
          <span className="button-icon">▣</span>
          <span>
            <strong>CPUと対戦</strong>
            <small>CPUと白熱バトル！</small>
          </span>
        </button>
        <button className="mega-button green-button" type="button" onClick={onStartPuzzle}>
          <span className="button-icon">✚</span>
          <span>
            <strong>詰め割り箸</strong>
            <small>1手で勝てる手を見つけよう！</small>
          </span>
        </button>
      </div>

      <div className="mini-actions">
        <button className="bevel-button blue-button" type="button" onClick={onShowRules}>📖 ルール説明</button>
        <button className="bevel-button blue-button" type="button" onClick={onShowRules}>？ 遊び方</button>
        <button className="bevel-button blue-button" type="button">🔈 サウンド：OFF</button>
      </div>

      <section className="rule-summary">
        <h2>割り箸バトルとは？</h2>
        <ul>
          <li>自分の手で相手の手を攻撃します</li>
          <li>攻撃された手には、数字が足されます</li>
          <li>合計が5以上になった手はDOWNします</li>
          <li>両手がDOWNしたら負けです</li>
          <li>分割すると、自分の左右の数字を組み替えられます</li>
        </ul>
        <div className="hands-doodle" aria-hidden="true">☝️ ✌️ ✋</div>
      </section>

      <footer className="title-footer">© 2026 Wari-bashi Battle</footer>
    </main>
  );
}
