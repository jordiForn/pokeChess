import { Injectable, signal } from '@angular/core';
import { Piece } from '../../shared/models/piece.model';
import { ChessMoveView } from '../../shared/models/chess-board.model';
import { PendingPromotionView } from '../../shared/models/promotion.model';
import { ForcedGameResult } from '../../shared/models/forced-game-result.model';

export type BoardColor = 'w' | 'b';

@Injectable({ providedIn: 'root' })
export class ChessStateService {
  private readonly fenSignal = signal(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  );
  private readonly selectedSquareSignal = signal<string | null>(null);
  private readonly legalMovesSignal = signal<ChessMoveView[]>([]);
  private readonly lastMoveSignal = signal<ChessMoveView | null>(null);
  private readonly invalidCaptureSquareSignal = signal<string | null>(null);
  private readonly piecesConfigSignal = signal<Piece[]>([]);
  private readonly turnSignal = signal<BoardColor>('w');
  private readonly messageSignal = signal<string | null>(null);
  private readonly pendingPromotionSignal = signal<PendingPromotionView | null>(null);
  private readonly forcedResultSignal = signal<ForcedGameResult | null>(null);

  readonly fen = this.fenSignal.asReadonly();
  readonly selectedSquare = this.selectedSquareSignal.asReadonly();
  readonly legalMoves = this.legalMovesSignal.asReadonly();
  readonly lastMove = this.lastMoveSignal.asReadonly();
  readonly invalidCaptureSquare = this.invalidCaptureSquareSignal.asReadonly();
  readonly piecesConfig = this.piecesConfigSignal.asReadonly();
  readonly turn = this.turnSignal.asReadonly();
  readonly message = this.messageSignal.asReadonly();
  readonly pendingPromotion = this.pendingPromotionSignal.asReadonly();
  readonly forcedResult = this.forcedResultSignal.asReadonly();

  setFen(fen: string): void {
    this.fenSignal.set(fen);
  }

  selectSquare(square: string | null): void {
    this.selectedSquareSignal.set(square);
  }

  setLegalMoves(moves: ChessMoveView[]): void {
    this.legalMovesSignal.set(moves);
  }

  setLastMove(move: ChessMoveView | null): void {
    this.lastMoveSignal.set(move);
  }

  setInvalidCaptureSquare(square: string | null): void {
    this.invalidCaptureSquareSignal.set(square);
  }

  setPiecesConfig(pieces: Piece[]): void {
    this.piecesConfigSignal.set(pieces);
  }

  setTurn(turn: BoardColor): void {
    this.turnSignal.set(turn);
  }

  setMessage(message: string | null): void {
    this.messageSignal.set(message);
  }

  setPendingPromotion(pending: PendingPromotionView | null): void {
    this.pendingPromotionSignal.set(pending);
  }

  setForcedResult(result: ForcedGameResult | null): void {
    this.forcedResultSignal.set(result);
  }

  reset(): void {
    this.fenSignal.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    this.selectedSquareSignal.set(null);
    this.legalMovesSignal.set([]);
    this.lastMoveSignal.set(null);
    this.invalidCaptureSquareSignal.set(null);
    this.turnSignal.set('w');
    this.messageSignal.set(null);
    this.pendingPromotionSignal.set(null);
    this.forcedResultSignal.set(null);
  }
}
