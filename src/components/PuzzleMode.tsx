import { useMemo, useState } from "react";
import { PUZZLES } from "../game/puzzles";
import { applyAttack, handLabel, hpLabel, isAlive, isDefeated } from "../game/rules";
import type { HandSide } from "../game/types";
import { HandCard } from "./HandCard";

type PuzzleModeProps = {
  onBackTitle: () => void;
  onOpenBattle: () => void;
  onShowRules: () => void;
};

type PuzzleResult =
  | { kind: "correct"; lines: string[] }
  | { kind: "wrong"; lines: string[] }
  | { kind: "answer"; lines: string[] }
  | null;

export function PuzzleMode({ onBackTitle, onOpenBattle, onShowRules }: PuzzleModeProps) {
  const [index, setIndex] = useState(0);
  const [selectedFrom, setSelectedFrom] = useState<HandSide | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<PuzzleResult>(null);
  const [displayCpuHands, setDisplayCpuHands] = useState(() => ({ ...PUZZLES[0].cpu }));

  const puzzle = PUZZLES[index];
  const playerHands = useMemo(() => ({ ...puzzle.player }), [puzzle]);
  const cpuHands = displayCpuHands;
  const canSwitchModes = result?.kind === "correct";

  function resetForProblem(nextIndex = index) {
    const nextPuzzle = PUZZLES[nextIndex];
    setIndex(nextIndex);
    setDisplayCpuHands({ ...nextPuzzle.cpu });
    setSelectedFrom(null);
    setShowHint(false);
    setResult(null);
  }

  function handlePlayerHand(side: HandSide) {
    if (!isAlive(playerHands[side])) return;
    setSelectedFrom(side);
    setResult(null);
  }

  function handleCpuHand(target: HandSide) {
    if (!selectedFrom || !isAlive(cpuHands[target])) return;

    const attacker = playerHands[selectedFrom];
    const before = cpuHands[target];
    const afterCpu = applyAttack(cpuHands, { type: "attack", from: selectedFrom, target }, attacker);
    const lines = [
      `${handLabel(selectedFrom)}（${attacker}）でCPUの${handLabel(target)}（${before}）を攻撃！`,
      `計算：${attacker} + ${before} = ${attacker + before}`,
    ];

    if (isDefeated(afterCpu)) {
      setDisplayCpuHands(afterCpu);
      setResult({
        kind: "correct",
        lines: [...lines, `CPUの${handLabel(target)}が5以上になり、DOWN！`, "正解！"],
      });
    } else {
      setResult({
        kind: "wrong",
        lines: [...lines, "その手ではまだ勝てません", "別の手を試してみよう"],
      });
    }
  }

  function showAnswer() {
    const { solution } = puzzle;
    const attacker = playerHands[solution.from];
    const target = cpuHands[solution.target];
    setSelectedFrom(solution.from);
    setResult({
      kind: "answer",
      lines: [
        `答え：${handLabel(solution.from)}（${attacker}）でCPUの${handLabel(solution.target)}（${target}）を攻撃！`,
        `計算：${attacker} + ${target} = ${attacker + target}`,
        puzzle.explanation,
      ],
    });
  }

  function nextProblem() {
    resetForProblem((index + 1) % PUZZLES.length);
  }

  return (
    <main className="app-shell puzzle-shell">
      <header className="board-header">
        <button className="logo-button" type="button" onClick={onBackTitle}>割り箸バトル</button>
        <span className="rule-badge">5以上で死ぬ派</span>
        <div className="header-actions">
          <button className="bevel-button dark-button" type="button" onClick={onBackTitle}>タイトルへ</button>
          <button className="bevel-button blue-button" type="button" onClick={onShowRules}>📖 ルール</button>
          <button className="bevel-button blue-button" type="button" onClick={() => resetForProblem()}>↻ リセット</button>
        </div>
      </header>

      <nav className="mode-tabs" aria-label="モード">
        <button className="tab is-locked" type="button" onClick={canSwitchModes ? onOpenBattle : undefined} disabled={!canSwitchModes}>CPUと対戦</button>
        <button className="tab is-active" type="button">詰め割り箸</button>
      </nav>
      {!canSwitchModes && <div className="switch-lock-note">問題中はモード切替できません</div>}

      <section className="puzzle-top">
        <div>
          <span className="problem-count">第 {index + 1} 問 / 全 {PUZZLES.length} 問</span>
          <h1>詰め割り箸</h1>
          <h2>1手で勝て！</h2>
          <p>1手でCPUの両手をDOWNにしよう！</p>
        </div>
        <div className="puzzle-buttons">
          <button className="bevel-button yellow-button" type="button" onClick={() => setShowHint((value) => !value)}>💡 ヒント</button>
          <button className="bevel-button green-button" type="button" onClick={showAnswer}>答えを見る</button>
          <button className="bevel-button blue-button" type="button" onClick={nextProblem}>➡ 次の問題</button>
        </div>
      </section>

      {showHint && <div className="hint-box">ヒント：{puzzle.hint}</div>}

      <section className="battle-frame puzzle-frame">
        <PuzzleArea label="CPU" color="blue" hands={cpuHands} hp={hpLabel(cpuHands)} targetable={!!selectedFrom} onHandClick={handleCpuHand} />

        <section className="center-message puzzle-message" aria-live="polite">
          <div className="turn-box">
            <span>{puzzle.difficulty.toUpperCase()}</span>
            <strong>{puzzle.mateIn}</strong>
          </div>
          <p>
            {result?.kind === "correct"
              ? "正解！"
              : result?.kind === "wrong"
                ? "別の手を試そう！"
                : result?.kind === "answer"
                  ? "答えを確認中"
                  : selectedFrom
                    ? "CPUの手を選んで！"
                    : "自分の手を選ぼう！"}
          </p>
          {result?.kind === "correct" && <div className="effect-text">正解！</div>}
        </section>

        <PuzzleArea
          label="あなた"
          color="red"
          hands={playerHands}
          hp={hpLabel(playerHands)}
          selectedSide={selectedFrom}
          onHandClick={handlePlayerHand}
        />
      </section>

      <section className={`answer-panel ${result?.kind ?? ""}`}>
        <div className="answer-title">
          {result?.kind === "correct" && "この問題の正解例"}
          {result?.kind === "wrong" && "もう一歩！"}
          {result?.kind === "answer" && "答え"}
          {!result && "操作ログ"}
        </div>
        {result ? result.lines.map((line) => <p key={line}>{line}</p>) : <p>自分の生きている手を選び、CPUの最後の手を倒そう。</p>}
      </section>
    </main>
  );
}

type PuzzleAreaProps = {
  label: "CPU" | "あなた";
  color: "blue" | "red";
  hands: { left: number; right: number };
  hp: string;
  selectedSide?: HandSide | null;
  targetable?: boolean;
  onHandClick: (side: HandSide) => void;
};

function PuzzleArea({ label, color, hands, hp, selectedSide = null, targetable = false, onHandClick }: PuzzleAreaProps) {
  return (
    <section className={`player-area ${color}-area`}>
      <div className="area-ribbon">{label}</div>
      <div className="hands-grid">
        <HandCard
          owner={label}
          side="left"
          value={hands.left}
          selected={selectedSide === "left"}
          selectable={label === "あなた" && isAlive(hands.left)}
          targetable={targetable && isAlive(hands.left)}
          disabled={!isAlive(hands.left)}
          onClick={() => onHandClick("left")}
        />
        <HandCard
          owner={label}
          side="right"
          value={hands.right}
          selected={selectedSide === "right"}
          selectable={label === "あなた" && isAlive(hands.right)}
          targetable={targetable && isAlive(hands.right)}
          disabled={!isAlive(hands.right)}
          onClick={() => onHandClick("right")}
        />
      </div>
      <aside className="status-box">
        <span>{label === "CPU" ? "CPUの状態" : "あなたの状態"}</span>
        <strong>{hp}</strong>
      </aside>
    </section>
  );
}
