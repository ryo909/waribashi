type RuleModalProps = {
  onClose: () => void;
};

export function RuleModal({ onClose }: RuleModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label="ルール説明" onClick={(event) => event.stopPropagation()}>
        <h2>ルール説明</h2>
        <ul>
          <li>生きている自分の手を選び、相手の生きている手を攻撃します。</li>
          <li>攻撃された手は、元の数字に攻撃した手の数字を足します。</li>
          <li>合計が5以上になった手は0になり、DOWNします。</li>
          <li>分割では左右の合計を保ったまま、1〜4の別配分にできます。</li>
          <li>両手がDOWNしたら負け。50ターン、または同じ局面3回で引き分けです。</li>
        </ul>
        <button className="bevel-button red-button" type="button" onClick={onClose}>OK!</button>
      </section>
    </div>
  );
}
