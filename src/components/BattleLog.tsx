import { useEffect, useRef } from "react";

type BattleLogProps = {
  entries: string[];
};

export function BattleLog({ entries }: BattleLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [entries]);

  return (
    <section className="battle-log" aria-label="対戦ログ">
      <div className="log-label">対戦ログ</div>
      <div className="log-screen" ref={logRef}>
        {entries.map((entry, index) => (
          <p key={`${entry}-${index}`}>{entry}</p>
        ))}
      </div>
    </section>
  );
}
