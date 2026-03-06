import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiRequestError, getRound, sendCommand } from "../lib/api";
import {
  COMMAND_DISPATCH_INTERVAL_MS,
  commandOutcomeMessage,
  enqueueCommand,
} from "../lib/command-dispatch";
import { GridBoard } from "../components/grid-board";
import { Hud } from "../components/hud";
import type { CommandInput } from "../types/game";

interface Props {
  roundId: string;
  onEnded: (roundId: string) => void;
}

export function RoundScreen({ roundId, onEnded }: Props) {
  const queryClient = useQueryClient();
  const queueRef = useRef<CommandInput[]>([]);
  const inFlightRef = useRef(false);
  const [inputNotice, setInputNotice] = useState<string>();

  const roundQuery = useQuery({
    queryKey: ["round", roundId],
    queryFn: () => getRound(roundId),
    refetchInterval: 800,
  });

  const commandMutation = useMutation({
    mutationFn: sendCommand,
  });

  const processNextCommand = useCallback(async () => {
    if (inFlightRef.current || queueRef.current.length === 0) {
      return;
    }

    const next = queueRef.current.shift();
    if (!next) {
      return;
    }
    inFlightRef.current = true;

    try {
      const response = await commandMutation.mutateAsync(next);
      queryClient.setQueryData(["round", roundId], response);
      setInputNotice(commandOutcomeMessage(response.commandOutcome));
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === "RATE_LIMITED") {
        const retrySeconds = Math.max(1, Math.ceil((error.retryAfterMs ?? 1_000) / 1_000));
        setInputNotice(`Input throttled. Try again in ~${retrySeconds}s.`);
      } else {
        setInputNotice("Command failed. Input queue continues.");
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [commandMutation, queryClient, roundId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void processNextCommand();
    }, COMMAND_DISPATCH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [processNextCommand]);

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
        event.preventDefault();
        queueRef.current = enqueueCommand(queueRef.current, {
          roundId,
          actorId: "player-1",
          action: "move",
          direction,
        });
      }

      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) {
          queueRef.current = enqueueCommand(queueRef.current, {
            roundId,
            actorId: "player-1",
            action: "bomb",
          });
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [roundId]);

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
        {inputNotice && <p role="status">{inputNotice}</p>}
      </div>
    </main>
  );
}
