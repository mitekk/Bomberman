import { Link } from "react-router-dom";
import type { RoundState } from "../types/game";

interface Props {
  round?: RoundState;
}

export function OutcomeScreen({ round }: Props) {
  const result = round?.result ?? "draw";

  return (
    <main className="screen outcome-screen">
      <h2>Round Complete</h2>
      <p className={`result result-${result}`}>Result: {result.toUpperCase()}</p>
      <div className="actions">
        <Link to="/">Play Again</Link>
        <Link to="/profile">View Profile</Link>
      </div>
    </main>
  );
}
