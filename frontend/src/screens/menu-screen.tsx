import { useState } from "react";

interface Props {
  onStart: (difficulty: "easy" | "normal" | "hard") => void;
}

export function MenuScreen({ onStart }: Props) {
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("normal");

  return (
    <main className="screen menu-screen">
      <h1>Bomberman-lite</h1>
      <p>Solo arena now, multiplayer-ready rules later.</p>
      <label>
        Difficulty
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <button onClick={() => onStart(difficulty)}>Start Round</button>
    </main>
  );
}
