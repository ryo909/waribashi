import { useState } from "react";
import { GameBoard } from "./components/GameBoard";
import { PuzzleMode } from "./components/PuzzleMode";
import { RuleModal } from "./components/RuleModal";
import { TitleScreen } from "./components/TitleScreen";
import type { CpuLevel } from "./game/types";

export type Screen = "title" | "battle" | "puzzle";

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [showRules, setShowRules] = useState(false);
  const [cpuLevel, setCpuLevel] = useState<CpuLevel>("normal");

  return (
    <>
      {screen === "title" && (
        <TitleScreen
          cpuLevel={cpuLevel}
          onCpuLevelChange={setCpuLevel}
          onStartBattle={() => setScreen("battle")}
          onStartPuzzle={() => setScreen("puzzle")}
          onShowRules={() => setShowRules(true)}
        />
      )}
      {screen === "battle" && (
        <GameBoard
          cpuLevel={cpuLevel}
          onBackTitle={() => setScreen("title")}
          onOpenPuzzle={() => setScreen("puzzle")}
          onShowRules={() => setShowRules(true)}
        />
      )}
      {screen === "puzzle" && (
        <PuzzleMode
          onBackTitle={() => setScreen("title")}
          onOpenBattle={() => setScreen("battle")}
          onShowRules={() => setShowRules(true)}
        />
      )}
      {showRules && <RuleModal onClose={() => setShowRules(false)} />}
    </>
  );
}
