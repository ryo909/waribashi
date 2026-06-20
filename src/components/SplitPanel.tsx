import type { SplitMove } from "../game/types";

type SplitPanelProps = {
  options: SplitMove[];
  onSplit: (move: SplitMove) => void;
  onClose: () => void;
};

export function SplitPanel({ options, onSplit, onClose }: SplitPanelProps) {
  return (
    <section className="split-panel">
      <div>
        <h3>分割候補</h3>
        <p>左右の合計を保ったまま、別の配分にします。</p>
      </div>
      <div className="split-options">
        {options.length === 0 ? (
          <span className="no-options">今は分割できません</span>
        ) : (
          options.map((option) => (
            <button
              className="bevel-button yellow-button"
              type="button"
              key={`${option.left}-${option.right}`}
              onClick={() => onSplit(option)}
            >
              左{option.left}・右{option.right}
            </button>
          ))
        )}
        <button className="bevel-button dark-button" type="button" onClick={onClose}>閉じる</button>
      </div>
    </section>
  );
}
