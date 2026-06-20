import type { HandSide } from "../game/types";
import { handLabel, isAlive } from "../game/rules";

type HandCardProps = {
  side: HandSide;
  value: number;
  owner: "CPU" | "PLAYER" | "あなた";
  selected?: boolean;
  targetable?: boolean;
  selectable?: boolean;
  isAttacker?: boolean;
  isTarget?: boolean;
  isHit?: boolean;
  isDownResult?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

function handIcon(value: number): string {
  if (value === 0) return "✊";
  if (value === 1) return "☝️";
  if (value === 2) return "✌️";
  if (value === 3) return "🤟";
  return "✋";
}

export function HandCard({
  side,
  value,
  owner,
  selected = false,
  targetable = false,
  selectable = false,
  isAttacker = false,
  isTarget = false,
  isHit = false,
  isDownResult = false,
  disabled = false,
  onClick,
}: HandCardProps) {
  const alive = isAlive(value);

  return (
    <button
      className={[
        "hand-card",
        alive ? "is-alive" : "is-down",
        selected ? "is-selected" : "",
        targetable ? "is-targetable" : "",
        selectable ? "is-selectable" : "",
        isAttacker ? "attacker-glow" : "",
        isTarget ? "target-hit" : "",
        isHit ? "is-hit" : "",
        isDownResult ? "just-downed" : "",
      ].join(" ")}
      type="button"
      disabled={disabled || !onClick}
      onClick={onClick}
      aria-label={`${owner}の${handLabel(side)} ${alive ? value : "DOWN"}`}
    >
      <span className="hand-side">{handLabel(side)}</span>
      <span className="hand-face" aria-hidden="true">{handIcon(value)}</span>
      <span className="hand-number">{value}</span>
      {(!alive || isDownResult) && <span className="down-stamp">DOWN!</span>}
      {targetable && <span className="target-arrow" aria-hidden="true">▼</span>}
    </button>
  );
}
