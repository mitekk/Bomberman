import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getProfile } from "../lib/api";

export function ProfileScreen() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  if (!profileQuery.data) {
    return <main className="screen">Loading profile...</main>;
  }

  const { profile } = profileQuery.data;

  return (
    <main className="screen profile-screen">
      <h2>{profile.displayName}</h2>
      <ul>
        <li>Rounds: {profile.roundsPlayed}</li>
        <li>Wins: {profile.wins}</li>
        <li>Losses: {profile.losses}</li>
        <li>Draws: {profile.draws}</li>
        <li>Eliminations: {profile.eliminations}</li>
        <li>Bombs placed: {profile.bombsPlaced}</li>
        <li>Longest streak: {profile.longestWinStreak}</li>
      </ul>
      <Link to="/">Back to menu</Link>
    </main>
  );
}
