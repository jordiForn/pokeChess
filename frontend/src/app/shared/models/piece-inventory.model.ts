import { PokemonPieceView } from './chess-board.model';

export interface SideInventory {
  captured: PokemonPieceView[];
  onBoard: Record<string, number>;
}
