export interface ProfileStats {
  displayName: string;
  avatar: string;
  roundsPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  eliminations: number;
  bombsPlaced: number;
  longestWinStreak: number;
  currentWinStreak: number;
}

export class ProfileStore {
  private stats: ProfileStats = {
    displayName: "Player",
    avatar: "classic",
    roundsPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    eliminations: 0,
    bombsPlaced: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
  };

  get(): ProfileStats {
    return this.stats;
  }

  updateResult(result: "win" | "lose" | "draw", bombsPlaced: number, eliminations: number): ProfileStats {
    this.stats.roundsPlayed += 1;
    this.stats.bombsPlaced += bombsPlaced;
    this.stats.eliminations += eliminations;

    if (result === "win") {
      this.stats.wins += 1;
      this.stats.currentWinStreak += 1;
      this.stats.longestWinStreak = Math.max(this.stats.longestWinStreak, this.stats.currentWinStreak);
    } else if (result === "lose") {
      this.stats.losses += 1;
      this.stats.currentWinStreak = 0;
    } else {
      this.stats.draws += 1;
      this.stats.currentWinStreak = 0;
    }

    return this.stats;
  }

  updateProfile(displayName: string, avatar: string): ProfileStats {
    this.stats = {
      ...this.stats,
      displayName,
      avatar,
    };
    return this.stats;
  }
}
