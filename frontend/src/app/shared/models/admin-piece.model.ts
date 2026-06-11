import { ChessPieceType } from './chess-piece-type';
import { PieceSide } from './piece.model';
import { PokemonType } from './pokemon-type';

export interface AdminPieceForm {
  side: PieceSide;
  chess_type: ChessPieceType;
  pokemon_name: string;
  pokemon_type: PokemonType;
  sprite_url: string;
}
