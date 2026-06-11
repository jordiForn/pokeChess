import { Injectable, signal } from '@angular/core';
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { CHESS_SYMBOL_TO_TYPE } from '../../shared/models/chess-board.model';
import { PokemonPieceView } from '../../shared/models/chess-board.model';
import { Piece, PieceSide } from '../../shared/models/piece.model';

const MAX_PER_TYPE: Record<PieceSymbol, number> = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
  k: 1,
};

@Injectable({ providedIn: 'root' })
export class PieceInventoryService {
  private readonly capturedByWhiteSignal = signal<PokemonPieceView[]>([]);
  private readonly capturedByBlackSignal = signal<PokemonPieceView[]>([]);
  private readonly onBoardWhiteSignal = signal<Record<PieceSymbol, number>>(this.emptyCounts());
  private readonly onBoardBlackSignal = signal<Record<PieceSymbol, number>>(this.emptyCounts());

  readonly capturedByWhite = this.capturedByWhiteSignal.asReadonly();
  readonly capturedByBlack = this.capturedByBlackSignal.asReadonly();
  readonly onBoardWhite = this.onBoardWhiteSignal.asReadonly();
  readonly onBoardBlack = this.onBoardBlackSignal.asReadonly();

  reset(): void {
    this.capturedByWhiteSignal.set([]);
    this.capturedByBlackSignal.set([]);
    this.onBoardWhiteSignal.set(this.emptyCounts());
    this.onBoardBlackSignal.set(this.emptyCounts());
  }

  initialize(chess: Chess, piecesConfig: Piece[]): void {
    this.reset();
    this.syncFromBoard(chess, piecesConfig);
  }

  registerCapture(
    moverColor: Color,
    capturedType: PieceSymbol,
    piecesConfig: Piece[],
  ): void {
    const capturedSide: PieceSide = moverColor === 'w' ? 'black' : 'white';
    const pokemon = this.resolvePokemon(capturedSide, capturedType, piecesConfig);

    if (!pokemon) {
      return;
    }

    if (moverColor === 'w') {
      this.capturedByWhiteSignal.update((items) => [...items, pokemon]);
    } else {
      this.capturedByBlackSignal.update((items) => [...items, pokemon]);
    }
  }

  syncFromBoard(chess: Chess, _piecesConfig: Piece[]): void {
    this.onBoardWhiteSignal.set(this.countOnBoard(chess, 'w'));
    this.onBoardBlackSignal.set(this.countOnBoard(chess, 'b'));
  }

  isWithinLimits(counts: Record<PieceSymbol, number>, type: PieceSymbol): boolean {
    return counts[type] <= MAX_PER_TYPE[type];
  }

  private countOnBoard(chess: Chess, color: Color): Record<PieceSymbol, number> {
    const counts = this.emptyCounts();

    for (let file = 0; file < 8; file++) {
      for (let rank = 1; rank <= 8; rank++) {
        const square = `${String.fromCharCode(97 + file)}${rank}` as Square;
        const piece = chess.get(square);
        if (piece?.color === color) {
          counts[piece.type]++;
        }
      }
    }

    return counts;
  }

  private resolvePokemon(
    side: PieceSide,
    type: PieceSymbol,
    piecesConfig: Piece[],
  ): PokemonPieceView | null {
    const chessType = CHESS_SYMBOL_TO_TYPE[type];
    const config = piecesConfig.find(
      (piece) => piece.side === side && piece.chess_type === chessType,
    );

    if (!config) {
      return null;
    }

    return {
      name: config.pokemon_name,
      type: config.pokemon_type,
      spriteUrl: config.sprite_url,
    };
  }

  private emptyCounts(): Record<PieceSymbol, number> {
    return { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  }
}
