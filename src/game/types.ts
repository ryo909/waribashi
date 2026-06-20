export type HandSide = "left" | "right";

export type Hands = Record<HandSide, number>;

export type PlayerId = "player" | "cpu";

export type CpuLevel = "easy" | "normal" | "hard";

export type AttackMove = {
  type: "attack";
  from: HandSide;
  target: HandSide;
};

export type SplitMove = {
  type: "split";
  left: number;
  right: number;
};

export type Move = AttackMove | SplitMove;

export type AttackAnimation = {
  id: number;
  attackerOwner: PlayerId;
  attackerHand: HandSide;
  targetOwner: PlayerId;
  targetHand: HandSide;
  attackerValue: number;
  targetBefore: number;
  targetAfter: number;
  isDown: boolean;
};

export type BattleState = {
  player: Hands;
  cpu: Hands;
  turn: PlayerId;
  turnNumber: number;
  winner: PlayerId | "draw" | null;
  positionCounts: Record<string, number>;
};

export type Puzzle = {
  id: string;
  title: string;
  difficulty: "easy" | "normal";
  player: Hands;
  cpu: Hands;
  mateIn: 1;
  solution: AttackMove;
  hint: string;
  explanation: string;
};
