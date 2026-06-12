export type ForcedGameResultType = 'checkmate' | 'draw';

export interface ForcedGameResult {
  type: ForcedGameResultType;
  winner?: 'w' | 'b';
  message: string;
}
