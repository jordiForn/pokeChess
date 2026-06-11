import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChessEngineService } from '../../core/services/chess-engine.service';
import { ChessStateService } from '../../core/services/chess-state.service';
import { GameStateService } from '../../core/services/game-state.service';
import { PieceService } from '../../core/services/piece.service';
import { GameMode } from '../../shared/models/game-mode.model';
import { ChessBoardComponent } from './components/chess-board/chess-board.component';
import { PieceInventoryPanelComponent } from './components/piece-inventory-panel/piece-inventory-panel.component';
import { PromotionModalComponent } from './components/promotion-modal/promotion-modal.component';

@Component({
  selector: 'app-chess',
  imports: [ChessBoardComponent, PieceInventoryPanelComponent, PromotionModalComponent],
  templateUrl: './chess.component.html',
  styleUrl: './chess.component.scss',
})
export class ChessComponent implements OnInit {
  private readonly engine = inject(ChessEngineService);
  private readonly chessState = inject(ChessStateService);
  private readonly gameState = inject(GameStateService);
  private readonly pieceService = inject(PieceService);
  private readonly route = inject(ActivatedRoute);

  private currentMode: GameMode = 'ai';

  protected readonly pokemonMessage = this.chessState.message;
  protected readonly vsAi = this.gameState.vsAi;
  protected readonly aiThinking = this.gameState.aiThinking;

  protected readonly statusMessage = computed(() => {
    this.chessState.fen();
    return this.engine.getStatusMessage();
  });

  protected readonly turnLabel = computed(() => {
    this.chessState.turn();
    return this.engine.getTurnLabel();
  });

  protected readonly isGameOver = computed(() => {
    this.chessState.fen();
    return this.engine.isGameOver();
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.currentMode = params.get('mode') === 'local' ? 'local' : 'ai';
      this.startNewGame(this.currentMode);
    });
  }

  protected newGame(): void {
    this.engine.newGame(this.currentMode);
  }

  private startNewGame(mode: GameMode): void {
    this.pieceService.loadPieces().subscribe({
      next: () => this.engine.newGame(mode),
      error: () => this.engine.newGame(mode),
    });
  }
}
