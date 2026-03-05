import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { createRound, getRound } from "./lib/api";
import { MenuScreen } from "./screens/menu-screen";
import { RoundScreen } from "./screens/round-screen";
import { OutcomeScreen } from "./screens/outcome-screen";
import { ProfileScreen } from "./screens/profile-screen";
import type { RoundState } from "./types/game";

const queryClient = new QueryClient();

function AppRoutes() {
  const [endedRound, setEndedRound] = useState<RoundState | undefined>();
  const navigate = useNavigate();

  const startRound = async (difficulty: "easy" | "normal" | "hard") => {
    const response = await createRound(difficulty);
    setEndedRound(undefined);
    navigate(`/round/${response.round.id}`);
  };

  const handleEnded = async (roundId: string) => {
    const response = await getRound(roundId);
    setEndedRound(response.round);
    navigate("/outcome");
  };

  return (
    <Routes>
      <Route path="/" element={<MenuScreen onStart={startRound} />} />
      <Route path="/round/:roundId" element={<RoundRoute onEnded={handleEnded} />} />
      <Route path="/outcome" element={<OutcomeScreen round={endedRound} />} />
      <Route path="/profile" element={<ProfileScreen />} />
    </Routes>
  );
}

function RoundRoute({ onEnded }: { onEnded: (roundId: string) => void }) {
  const params = useParams();
  const roundId = params.roundId;

  if (!roundId) {
    return <main className="screen">Missing round id.</main>;
  }

  return <RoundScreen roundId={roundId} onEnded={onEnded} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
