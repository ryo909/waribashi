import type { AttackMove, BattleState, HandSide, Hands, PlayerId } from "./types";

export const DOWN_VALUE = 0;
export const DEATH_THRESHOLD = 5;
export const MAX_TURNS = 50;

export const INITIAL_HANDS: Hands = { left: 1, right: 1 };

export function cloneHands(hands: Hands): Hands {
  return { left: hands.left, right: hands.right };
}

export function isAlive(value: number): boolean {
  return value > DOWN_VALUE;
}

export function countAliveHands(hands: Hands): number {
  return Number(isAlive(hands.left)) + Number(isAlive(hands.right));
}

export function isDefeated(hands: Hands): boolean {
  return countAliveHands(hands) === 0;
}

export function resolveAttackValue(attackerValue: number, targetValue: number): number {
  const total = attackerValue + targetValue;
  return total >= DEATH_THRESHOLD ? DOWN_VALUE : total;
}

export function applyAttack(targetHands: Hands, move: AttackMove, attackerValue: number): Hands {
  const next = cloneHands(targetHands);
  next[move.target] = resolveAttackValue(attackerValue, targetHands[move.target]);
  return next;
}

export function opponentOf(player: PlayerId): PlayerId {
  return player === "player" ? "cpu" : "player";
}

export function handLabel(side: HandSide): string {
  return side === "left" ? "左手" : "右手";
}

export function playerLabel(player: PlayerId): string {
  return player === "player" ? "あなた" : "CPU";
}

export function hpLabel(hands: Hands): string {
  return `HP ${countAliveHands(hands)}/2`;
}

export function positionKey(state: Pick<BattleState, "player" | "cpu" | "turn">): string {
  return `${state.turn}|P:${state.player.left},${state.player.right}|C:${state.cpu.left},${state.cpu.right}`;
}

export function judgeWinner(state: BattleState): PlayerId | "draw" | null {
  if (isDefeated(state.cpu)) return "player";
  if (isDefeated(state.player)) return "cpu";
  if (state.turnNumber > MAX_TURNS) return "draw";
  const key = positionKey(state);
  if ((state.positionCounts[key] ?? 0) >= 3) return "draw";
  return null;
}
