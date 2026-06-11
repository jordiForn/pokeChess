import { Component, computed, inject } from '@angular/core';
import { BoardSquareView } from '../../../../shared/models/chess-board.model';
import { ChessEngineService } from '../../../../core/services/chess-engine.service';
import { ChessStateService } from '../../../../core/services/chess-state.service';
import { GameStateService } from '../../../../core/services/game-state.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss',
})
export class ChessBoardComponent {
  private readonly engine = inject(ChessEngineService);
  private readonly chessState = inject(ChessStateService);
  private readonly gameState = inject(GameStateService);

  protected readonly canInteract = computed(() => {
    this.gameState.aiThinking();
    this.chessState.fen();
    this.chessState.turn();
    this.chessState.pendingPromotion();
    return this.engine.canInteract();
  });

  protected pieceName(type: string): string {
    const names: Record<string, string> = {
      p: 'Peón',
      n: 'Caballo',
      b: 'Alfil',
      r: 'Torre',
      q: 'Reina',
      k: 'Rey',
    };
  
    return names[type] ?? type;
  }

  protected readonly aiThinking = this.gameState.aiThinking;

  protected readonly boardRows = computed(() => {
    this.chessState.fen();
    this.chessState.selectedSquare();
    this.chessState.legalMoves();
    this.chessState.lastMove();
    this.chessState.invalidCaptureSquare();
    this.chessState.piecesConfig();
    this.gameState.aiThinking();

    const squares = this.engine.getBoardSquares();
    const rows: BoardSquareView[][] = [];

    for (let row = 0; row < 8; row++) {
      rows.push(squares.filter((square) => square.row === row));
    }

    return rows;
  });

  protected isSelected(notation: string): boolean {
    return this.chessState.selectedSquare() === notation;
  }

  protected isLegalTarget(notation: string): boolean {
    return this.chessState.legalMoves().some((move) => move.to === notation);
  }

  protected isLastMove(notation: string): boolean {
    const lastMove = this.chessState.lastMove();
    return lastMove?.from === notation || lastMove?.to === notation;
  }

  protected isInvalidCapture(notation: string): boolean {
    return this.chessState.invalidCaptureSquare() === notation;
  }

  protected squareLabel(square: BoardSquareView): string {
    if (!square.piece?.pokemon) {
      return square.notation;
    }

    return `${square.notation}: ${square.piece.pokemon.name} (${square.piece.pokemon.type})`;
  }

  protected onSquareClick(notation: string): void {
    this.engine.selectSquare(notation);
  }
}
