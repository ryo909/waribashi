import type { AttackMove, HandSide, Hands, Move, SplitMove } from "./types";
import { applyAttack, isAlive } from "./rules";

const SIDES: HandSide[] = ["left", "right"];

export function getAttackMoves(attacker: Hands, target: Hands): AttackMove[] {
  return SIDES.flatMap((from) =>
    SIDES.filter((targetSide) => isAlive(attacker[from]) && isAlive(target[targetSide])).map((targetSide) => ({
      type: "attack" as const,
      from,
      target: targetSide,
    })),
  );
}

export function getSplitOptions(hands: Hands): SplitMove[] {
  const total = hands.left + hands.right;
  const options: SplitMove[] = [];

  for (let left = 1; left <= 4; left += 1) {
    const right = total - left;
    if (right < 1 || right > 4) continue;
    if (left === hands.left && right === hands.right) continue;
    if (left === hands.right && right === hands.left) continue;
    options.push({ type: "split", left, right });
  }

  return options;
}

export function getLegalMoves(actor: Hands, target: Hands): Move[] {
  return [...getAttackMoves(actor, target), ...getSplitOptions(actor)];
}

export function previewAttack(attacker: Hands, target: Hands, move: AttackMove): Hands {
  return applyAttack(target, move, attacker[move.from]);
}

export function isSameAttack(a: AttackMove, b: AttackMove): boolean {
  return a.type === b.type && a.from === b.from && a.target === b.target;
}
