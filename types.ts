export enum GameState {
  INTRO = 'INTRO',
  WALKING = 'WALKING',
  QUESTION = 'QUESTION',
  GAME_OVER = 'GAME_OVER',
  WALKING_ALONE = 'WALKING_ALONE', // The girl walks alone at the end
  VICTORY = 'VICTORY'
}

export type BackgroundTheme = 'school' | 'cafe' | 'night' | 'gym' | 'bus_station' | 'restaurant' | 'night_view_date' | 'default';

export interface Memory {
  id: number;
  question: string;
  optionA: string; // The "Left" option
  optionB: string; // The "Right" option
  correctOption: 'A' | 'B';
  failMessage: string;
  theme: BackgroundTheme;
}

export interface Position {
  x: number;
  y: number;
}