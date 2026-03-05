import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRound, sendCommand } from "../lib/api";
import { GridBoard } from "../components/grid-board";
import { Hud } from "../components/hud";

interface Props {
  roundId: string;
  onEnded: (roundId: string) => void;
}

export function RoundScreen({ roundId, onEnded }: Props) {
  const queryClient = useQueryClient();

  const roundQuery = useQuery({
    queryKey: ["round", roundId],
    queryFn: () => getRound(roundId),
    refetchInterval: 350,
  });

  const commandMutation = useMutation({
    mutationFn: sendCommand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
    },
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const map: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const direction = map[event.key];
      if (direction) {
        commandMutation.mutate({ roundId, actorId: "player-1", action: "move", direction });
      }

      if (event.code === "Space") {
        commandMutation.mutate({ roundId, actorId: "player-1", action: "bomb" });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandMutation, roundId]);

  const round = roundQuery.data?.round;

  useEffect(() => {
    if (round?.status === "ended") {
      onEnded(round.id);
    }
  }, [round, onEnded]);

  if (!round) {
    return <main className="screen">Loading round...</main>;
  }

  return (
    <main className="screen round-screen">
      <Hud round={round} />
      <GridBoard round={round} />
      <div className="controls">
        <p>Use arrow keys to move. Press Space to place a bomb.</p>
      </div>
    </main>
  );
}
