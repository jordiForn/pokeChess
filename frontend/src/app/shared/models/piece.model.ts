import { ChessPieceType } from './chess-piece-type';
import { PokemonType } from './pokemon-type';

export type PieceSide = 'white' | 'black';

export interface Piece {
  id: number;
  side: PieceSide;
  chess_type: ChessPieceType;
  pokemon_name: string;
  pokemon_type: PokemonType;
  sprite_url: string;
  updated_at: string;
}
