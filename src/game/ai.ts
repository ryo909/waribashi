import type { CpuLevel, Hands, Move } from "./types";
import { applyAttack, isDefeated, resolveAttackValue } from "./rules";
import { getAttackMoves, getLegalMoves, getSplitOptions, previewAttack } from "./moves";

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function applyMoveToHands(actor: Hands, target: Hands, move: Move): { actor: Hands; target: Hands } {
  if (move.type === "attack") {
    return {
      actor,
      target: applyAttack(target, move, actor[move.from]),
    };
  }

  return {
    actor: { left: move.left, right: move.right },
    target,
  };
}

function canWinNextTurn(attacker: Hands, target: Hands): boolean {
  return getAttackMoves(attacker, target).some((move) => isDefeated(previewAttack(attacker, target, move)));
}

function chooseNormalMove(cpu: Hands, player: Hands): Move {
  const attacks = getAttackMoves(cpu, player);
  const winningAttack = attacks.find((move) => isDefeated(previewAttack(cpu, player, move)));
  if (winningAttack) return winningAttack;

  const downAttack = attacks.find((move) => resolveAttackValue(cpu[move.from], player[move.target]) === 0);
  if (downAttack) return downAttack;

  const splits = getSplitOptions(cpu);
  const reviveSplit = splits.find((move) => cpu.left === 0 || cpu.right === 0);
  if (reviveSplit) return reviveSplit;

  return pickRandom(getLegalMoves(cpu, player));
}

function chooseHardMove(cpu: Hands, player: Hands): Move {
  const legalMoves = getLegalMoves(cpu, player);
  const attacks = getAttackMoves(cpu, player);

  const winningAttack = attacks.find((move) => isDefeated(previewAttack(cpu, player, move)));
  if (winningAttack) return winningAttack;

  const downAttacks = attacks.filter((move) => resolveAttackValue(cpu[move.from], player[move.target]) === 0);
  if (downAttacks.length > 0) {
    const strongHandDown = downAttacks.find((move) => player[move.target] >= 3);
    return strongHandDown ?? downAttacks[0];
  }

  const safeMoves = legalMoves.filter((move) => {
    const next = applyMoveToHands(cpu, player, move);
    return !canWinNextTurn(next.target, next.actor);
  });
  const candidates = safeMoves.length > 0 ? safeMoves : legalMoves;

  const splits = candidates.filter((move) => move.type === "split");
  const reviveSplit = splits.find(() => cpu.left === 0 || cpu.right === 0);
  if (reviveSplit) return reviveSplit;

  const scored = candidates.map((move) => {
    const next = applyMoveToHands(cpu, player, move);
    const playerThreat = Math.max(next.target.left, next.target.right);
    const cpuAlive = Number(next.actor.left > 0) + Number(next.actor.right > 0);
    const playerAlive = Number(next.target.left > 0) + Number(next.target.right > 0);
    const spreadBonus = next.actor.left === next.actor.right ? 1 : 0;

    return {
      move,
      score: cpuAlive * 8 - playerAlive * 5 - playerThreat + spreadBonus,
    };
  });

  const bestScore = Math.max(...scored.map((item) => item.score));
  return pickRandom(scored.filter((item) => item.score === bestScore).map((item) => item.move));
}

export function chooseCpuMove(cpu: Hands, player: Hands, level: CpuLevel): Move {
  const legalMoves = getLegalMoves(cpu, player);

  if (level === "easy") return pickRandom(legalMoves);
  if (level === "hard") return chooseHardMove(cpu, player);
  return chooseNormalMove(cpu, player);
}
