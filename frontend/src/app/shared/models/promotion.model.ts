import { PieceSymbol } from 'chess.js';
import { PokemonPieceView } from './chess-board.model';

export interface PendingPromotionView {
  from: string;
  to: string;
}

export interface PromotionOptionView {
  piece: PieceSymbol;
  label: string;
  pokemon: PokemonPieceView | null;
}

export const PROMOTION_OPTIONS: { piece: PieceSymbol; label: string }[] = [
  { piece: 'q', label: 'Dama' },
  { piece: 'r', label: 'Torre' },
  { piece: 'b', label: 'Alfil' },
  { piece: 'n', label: 'Caballo' },
];
