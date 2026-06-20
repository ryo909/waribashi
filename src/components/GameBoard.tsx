import { useEffect, useMemo, useRef, useState } from "react";
import { chooseCpuMove } from "../game/ai";
import { getSplitOptions } from "../game/moves";
import {
  INITIAL_HANDS,
  applyAttack,
  handLabel,
  hpLabel,
  isAlive,
  judgeWinner,
  playerLabel,
  positionKey,
} from "../game/rules";
import type { AttackAnimation, BattleState, CpuLevel, HandSide, Move, PlayerId, SplitMove } from "../game/types";
import { BattleLog } from "./BattleLog";
import { HandCard } from "./HandCard";
import { ResultModal } from "./ResultModal";
import { SplitPanel } from "./SplitPanel";

type GameBoardProps = {
  cpuLevel: CpuLevel;
  onBackTitle: () => void;
  onOpenPuzzle: () => void;
  onShowRules: () => void;
};

function createInitialState(): BattleState {
  const state: BattleState = {
    player: { ...INITIAL_HANDS },
    cpu: { ...INITIAL_HANDS },
    turn: "player",
    turnNumber: 1,
    winner: null,
    positionCounts: {},
  };
  return {
    ...state,
    positionCounts: { [positionKey(state)]: 1 },
  };
}

function heartsFor(hp: string) {
  return hp.endsWith("2/2") ? "♥♥" : hp.endsWith("1/2") ? "♥♡" : "♡♡";
}

const CPU_LEVEL_LABEL: Record<CpuLevel, string> = {
  easy: "よわい",
  normal: "ふつう",
  hard: "つよい",
};

export function GameBoard({ cpuLevel, onBackTitle, onOpenPuzzle, onShowRules }: GameBoardProps) {
  const [state, setState] = useState<BattleState>(() => createInitialState());
  const [log, setLog] = useState<string[]>(["TURN 1：あなたの番です"]);
  const [selectedFrom, setSelectedFrom] = useState<HandSide | null>(null);
  const [showSplit, setShowSplit] = useState(false);
  const [effectText, setEffectText] = useState<string | null>(null);
  const [attackAnimation, setAttackAnimation] = useState<AttackAnimation | null>(null);
  const animationIdRef = useRef(0);

  const splitOptions = useMemo(() => getSplitOptions(state.player), [state.player]);
  const isAnimating = attackAnimation !== null;

  function resetGame() {
    setState(createInitialState());
    setLog(["TURN 1：あなたの番です"]);
    setSelectedFrom(null);
    setShowSplit(false);
    setEffectText(null);
    setAttackAnimation(null);
  }

  function pushLog(entries: string[]) {
    setLog((current) => [...current, ...entries].slice(-80));
  }

  function finishMove(previous: BattleState, nextBase: BattleState): BattleState {
    const key = positionKey(nextBase);
    const positionCounts = {
      ...previous.positionCounts,
      [key]: (previous.positionCounts[key] ?? 0) + 1,
    };
    const judged = { ...nextBase, positionCounts };
    return { ...judged, winner: judgeWinner(judged) };
  }

  function describeMove(actor: PlayerId, move: Move, before: BattleState, after: BattleState): string[] {
    const actorName = playerLabel(actor);
    const targetName = playerLabel(actor === "player" ? "cpu" : "player");
    const actorHands = before[actor];
    const targetHands = before[actor === "player" ? "cpu" : "player"];

    if (move.type === "split") {
      return [
        `TURN ${before.turnNumber}：${actorName}は分割しました`,
        `${actorHands.left}・${actorHands.right} → ${move.left}・${move.right}`,
        `TURN ${after.turnNumber}：${after.turn === "player" ? "あなたの番です" : "CPUの番です"}`,
      ];
    }

    const attackerValue = actorHands[move.from];
    const targetValue = targetHands[move.target];
    const resultValue = after[actor === "player" ? "cpu" : "player"][move.target];
    const downLine = resultValue === 0 ? `${targetName}の${handLabel(move.target)}がDOWN！` : `${targetName}の${handLabel(move.target)}の数字が${resultValue}になった！`;

    return [
      `TURN ${before.turnNumber}：${actorName}の${handLabel(move.from)}（${attackerValue}）が、${targetName}の${handLabel(move.target)}（${targetValue}）を攻撃！`,
      `計算：${targetValue} + ${attackerValue} = ${attackerValue + targetValue}`,
      downLine,
      `TURN ${after.turnNumber}：${after.turn === "player" ? "あなたの番です" : "CPUの番です"}`,
    ];
  }

  function performMove(actor: PlayerId, move: Move) {
    const previous = state;
    if (previous.winner || previous.turn !== actor || isAnimating) return;

    const target = actor === "player" ? "cpu" : "player";
    let nextBase: BattleState;
    let nextAnimation: AttackAnimation | null = null;

    if (move.type === "attack") {
      const attackerValue = previous[actor][move.from];
      const targetBefore = previous[target][move.target];
      nextBase = {
        ...previous,
        [target]: applyAttack(previous[target], move, attackerValue),
        turn: actor === "player" ? "cpu" : "player",
        turnNumber: previous.turnNumber + 1,
      };
      const targetAfter = nextBase[target][move.target];
      animationIdRef.current += 1;
      nextAnimation = {
        id: animationIdRef.current,
        attackerOwner: actor,
        attackerHand: move.from,
        targetOwner: target,
        targetHand: move.target,
        attackerValue,
        targetBefore,
        targetAfter,
        isDown: targetAfter === 0,
      };
    } else {
      nextBase = {
        ...previous,
        [actor]: { left: move.left, right: move.right },
        turn: actor === "player" ? "cpu" : "player",
        turnNumber: previous.turnNumber + 1,
      };
    }

    const next = finishMove(previous, nextBase);
    const moveLog = describeMove(actor, move, previous, next);
    pushLog(next.winner ? [...moveLog, resultLine(next.winner)] : moveLog);

    if (next.winner) setEffectText(resultWord(next.winner));
    setAttackAnimation(nextAnimation);
    setState(next);
    setSelectedFrom(null);
    setShowSplit(false);
  }

  function resultWord(winner: PlayerId | "draw") {
    if (winner === "player") return "WIN!";
    if (winner === "cpu") return "LOSE...";
    return "DRAW!";
  }

  function resultLine(winner: PlayerId | "draw") {
    if (winner === "player") return "RESULT：あなたの勝ち！";
    if (winner === "cpu") return "RESULT：CPUの勝ち！";
    return "RESULT：引き分け！";
  }

  function handlePlayerHand(side: HandSide) {
    if (state.winner || state.turn !== "player" || isAnimating || !isAlive(state.player[side])) return;
    setSelectedFrom(side);
    setShowSplit(false);
  }

  function handleCpuHand(side: HandSide) {
    if (state.winner || state.turn !== "player" || isAnimating || !selectedFrom || !isAlive(state.cpu[side])) return;
    performMove("player", { type: "attack", from: selectedFrom, target: side });
  }

  function handleSplit(move: SplitMove) {
    if (state.winner || state.turn !== "player" || isAnimating) return;
    performMove("player", move);
  }

  useEffect(() => {
    if (!effectText) return;
    const timer = window.setTimeout(() => setEffectText(null), 950);
    return () => window.clearTimeout(timer);
  }, [effectText]);

  useEffect(() => {
    if (!attackAnimation) return;
    const timer = window.setTimeout(() => setAttackAnimation(null), 1100);
    return () => window.clearTimeout(timer);
  }, [attackAnimation]);

  useEffect(() => {
    if (state.turn !== "cpu" || state.winner || isAnimating) return;
    const timer = window.setTimeout(() => {
      const move = chooseCpuMove(state.cpu, state.player, cpuLevel);
      performMove("cpu", move);
    }, 760);
    return () => window.clearTimeout(timer);
  }, [state, isAnimating, cpuLevel]);

  function isAnimationHand(owner: PlayerId, side: HandSide, role: "attacker" | "target") {
    if (!attackAnimation) return false;
    if (role === "attacker") {
      return attackAnimation.attackerOwner === owner && attackAnimation.attackerHand === side;
    }
    return attackAnimation.targetOwner === owner && attackAnimation.targetHand === side;
  }

  function attackBannerText(animation: AttackAnimation) {
    const attacker = `${playerLabel(animation.attackerOwner)}の${handLabel(animation.attackerHand)}`;
    const target = `${playerLabel(animation.targetOwner)}の${handLabel(animation.targetHand)}`;
    return `${attacker} → ${target}！`;
  }

  return (
    <main className="app-shell board-shell">
      <header className="board-header">
        <button className="logo-button" type="button" onClick={onBackTitle}>割り箸バトル</button>
        <span className="rule-badge">5以上で死ぬ派</span>
        <div className="header-actions">
          <button className="bevel-button dark-button" type="button" onClick={onBackTitle}>タイトルへ</button>
          <button className="bevel-button blue-button" type="button" onClick={onShowRules}>📖 ルール</button>
          <button className="bevel-button blue-button" type="button" onClick={resetGame}>↻ リセット</button>
        </div>
      </header>

      <nav className="mode-tabs" aria-label="モード">
        <button className="tab is-active" type="button">CPUと対戦</button>
        <button className="tab is-locked" type="button" onClick={state.winner ? onOpenPuzzle : undefined} disabled={!state.winner || isAnimating}>
          詰め割り箸
        </button>
      </nav>
      {!state.winner && <div className="switch-lock-note">対戦中はモード切替できません / CPU：{CPU_LEVEL_LABEL[cpuLevel]}</div>}

      <section className="battle-frame">
        <PlayerArea
          label="CPU"
          ownerId="cpu"
          color="blue"
          hands={state.cpu}
          hp={hpLabel(state.cpu)}
          selectedSide={null}
          targetSide={selectedFrom}
          isAttacker={(side) => isAnimationHand("cpu", side, "attacker")}
          isTarget={(side) => isAnimationHand("cpu", side, "target")}
          isHit={(side) => isAnimationHand("cpu", side, "target")}
          isDownResult={(side) => attackAnimation?.targetOwner === "cpu" && attackAnimation.targetHand === side && attackAnimation.isDown}
          onHandClick={handleCpuHand}
          disabled={state.turn !== "player" || !!state.winner || isAnimating}
        />

        <section className="center-message" aria-live="polite">
          <div className="turn-box">
            <span>ターン</span>
            <strong>{state.turnNumber}</strong>
          </div>
          {attackAnimation ? (
            <div className="attack-banner">
              <strong>{attackBannerText(attackAnimation)}</strong>
              <span>{attackAnimation.targetBefore} + {attackAnimation.attackerValue} = {attackAnimation.targetBefore + attackAnimation.attackerValue}</span>
              <b>
                {attackAnimation.isDown
                  ? `${playerLabel(attackAnimation.targetOwner)}の${handLabel(attackAnimation.targetHand)}がDOWN！`
                  : `${playerLabel(attackAnimation.targetOwner)}の${handLabel(attackAnimation.targetHand)}は${attackAnimation.targetAfter}！`}
              </b>
            </div>
          ) : (
            <p>
              {state.winner
                ? resultLine(state.winner)
                : state.turn === "cpu"
                  ? "CPUの番です"
                  : selectedFrom
                    ? "攻撃する相手の手を選んで！"
                    : "自分の手を選んで攻撃！"}
            </p>
          )}
          {selectedFrom && <div className="attack-call">攻撃！</div>}
          {effectText && <div className="effect-text">{effectText}</div>}
        </section>

        <PlayerArea
          label="PLAYER"
          ownerId="player"
          color="red"
          hands={state.player}
          hp={hpLabel(state.player)}
          selectedSide={selectedFrom}
          targetSide={null}
          isAttacker={(side) => isAnimationHand("player", side, "attacker")}
          isTarget={(side) => isAnimationHand("player", side, "target")}
          isHit={(side) => isAnimationHand("player", side, "target")}
          isDownResult={(side) => attackAnimation?.targetOwner === "player" && attackAnimation.targetHand === side && attackAnimation.isDown}
          onHandClick={handlePlayerHand}
          disabled={state.turn !== "player" || !!state.winner || isAnimating}
        />
      </section>

      <div className="control-row">
        <button className="bevel-button yellow-button" type="button" onClick={() => setShowSplit((value) => !value)} disabled={state.turn !== "player" || !!state.winner || isAnimating}>
          ⇆ 分割する
        </button>
        <button className="bevel-button blue-button" type="button" onClick={onShowRules}>📖 ルールを見る</button>
        <button className="bevel-button purple-button" type="button" onClick={resetGame}>↻ リセット</button>
      </div>

      {showSplit && <SplitPanel options={splitOptions} onSplit={handleSplit} onClose={() => setShowSplit(false)} />}
      <BattleLog entries={log} />
      {state.winner && !isAnimating && <ResultModal winner={state.winner} onReset={resetGame} onTitle={onBackTitle} />}
    </main>
  );
}

type PlayerAreaProps = {
  label: "CPU" | "PLAYER";
  ownerId: PlayerId;
  color: "blue" | "red";
  hands: { left: number; right: number };
  hp: string;
  selectedSide: HandSide | null;
  targetSide: HandSide | null;
  isAttacker: (side: HandSide) => boolean;
  isTarget: (side: HandSide) => boolean;
  isHit: (side: HandSide) => boolean;
  isDownResult: (side: HandSide) => boolean;
  disabled: boolean;
  onHandClick: (side: HandSide) => void;
};

function PlayerArea({ label, ownerId, color, hands, hp, selectedSide, targetSide, isAttacker, isTarget, isHit, isDownResult, disabled, onHandClick }: PlayerAreaProps) {
  return (
    <section className={`player-area ${color}-area`}>
      <div className="area-ribbon">{label}</div>
      <div className="hands-grid">
        <HandCard
          owner={label}
          side="left"
          value={hands.left}
          selected={selectedSide === "left"}
          selectable={ownerId === "player" && isAlive(hands.left)}
          targetable={targetSide !== null && isAlive(hands.left)}
          isAttacker={isAttacker("left")}
          isTarget={isTarget("left")}
          isHit={isHit("left")}
          isDownResult={isDownResult("left")}
          disabled={disabled || !isAlive(hands.left)}
          onClick={() => onHandClick("left")}
        />
        <HandCard
          owner={label}
          side="right"
          value={hands.right}
          selected={selectedSide === "right"}
          selectable={ownerId === "player" && isAlive(hands.right)}
          targetable={targetSide !== null && isAlive(hands.right)}
          isAttacker={isAttacker("right")}
          isTarget={isTarget("right")}
          isHit={isHit("right")}
          isDownResult={isDownResult("right")}
          disabled={disabled || !isAlive(hands.right)}
          onClick={() => onHandClick("right")}
        />
      </div>
      <aside className="status-box">
        <span>{label === "CPU" ? "CPUの状態" : "あなたの状態"}</span>
        <strong>{hp}</strong>
        <b>{heartsFor(hp)}</b>
      </aside>
    </section>
  );
}
