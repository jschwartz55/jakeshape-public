export type GameState = 'startMenu' | 'playing' | 'endMenu';

export type Plates = {
  totalLowerLBS: number;
  plates: number[];
};

export type LeaderboardData = {
  score: number;
  name: string;
};
export type LeaderboardsData = {
  easy: LeaderboardData[];
  normal: LeaderboardData[];
  hard: LeaderboardData[];
  expert: LeaderboardData[];
};

export type GameMode = 'easy' | 'normal' | 'hard' | 'expert';

export type BarbellWeightKg = 20 | 25;

export type FormCheckOption = {
  id: string;
  label: string;
  name: string;
  value: string | number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isChecked: boolean;
};

export type WeightWhizStartMenuProps = {
  startGame: () => void;
};

export type WeightWhizGameScreenProps = {
  incrementScore: () => void;
};

export type WeightWhizGraphicProps = {
  plates: number[];
  includeClip: boolean;
};

export type WeightWhizGameSettingsProps = {
  barbellWeightKg: BarbellWeightKg;
  gameMode: GameMode;
  includeClip: boolean;
  handleBarbellWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGameModeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleIncludeClipChange: () => void;
};

export type WeightWhizLeaderboardTableProps = {
  gameMode: GameMode;
};

export type WeightWhizCountdownTimerProps = {
  gameState: GameState;
  endGame: () => void;
};

export type WeightWhizGuessInputProps = {
  totalLowerLBS: number;
  totalUpperLBS: number;
  handleCorrectGuess: () => void;
};

export type WeightWhizEndGameMenuProps = {
  score: number;
  goToMainMenu: () => void;
  gameMode: GameMode;
  isLeaderboardScore: boolean;
};
