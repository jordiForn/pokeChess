import { Color, PieceSymbol } from 'chess.js';
import { ChessPieceType } from './chess-piece-type';
import { PokemonType } from './pokemon-type';

export interface PokemonPieceView {
  name: string;
  type: PokemonType;
  spriteUrl: string;
}

export interface BoardPieceView {
  color: Color;
  type: PieceSymbol;
  symbol: string;
  pokemon: PokemonPieceView | null;
}

export interface BoardSquareView {
  row: number;
  col: number;
  notation: string;
  fileLabel: string;
  rankLabel: string;
  isLight: boolean;
  piece: BoardPieceView | null;
}

export interface ChessMoveView {
  from: string;
  to: string;
  san: string;
}

export const CHESS_SYMBOL_TO_TYPE: Record<PieceSymbol, ChessPieceType> = {
  p: 'pawn',
  r: 'rook',
  n: 'knight',
  b: 'bishop',
  q: 'queen',
  k: 'king',
};
