import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChessEngineService } from '../../core/services/chess-engine.service';
import { ChessStateService } from '../../core/services/chess-state.service';
import { GameStateService } from '../../core/services/game-state.service';
import { PieceService } from '../../core/services/piece.service';
import { AlertService } from '../../core/services/alert.service';
import { GameMode } from '../../shared/models/game-mode.model';
import { ChessBoardComponent } from './components/chess-board/chess-board.component';
import { PieceInventoryPanelComponent } from './components/piece-inventory-panel/piece-inventory-panel.component';
import { PromotionModalComponent } from './components/promotion-modal/promotion-modal.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-chess',
  imports: [ChessBoardComponent, PieceInventoryPanelComponent, PromotionModalComponent, IconComponent],
  templateUrl: './chess.component.html',
  styleUrl: './chess.component.scss',
})
export class ChessComponent implements OnInit {
  private readonly engine = inject(ChessEngineService);
  private readonly chessState = inject(ChessStateService);
  private readonly gameState = inject(GameStateService);
  private readonly pieceService = inject(PieceService);
  private readonly route = inject(ActivatedRoute);
  private readonly alert = inject(AlertService);

  private currentMode: GameMode = 'ai';
  private lastPokemonMessage: string | null = null;
  private lastStatusMessage: string | null = null;

  protected readonly vsAi = this.gameState.vsAi;
  protected readonly aiThinking = this.gameState.aiThinking;

  protected readonly turnLabel = () => {
    this.chessState.turn();
    return this.engine.getTurnLabel();
  };

  protected readonly playerColorLabel = () => {
    this.gameState.playerColor();
    return this.gameState.playerColor() === 'w' ? 'blancas' : 'negras';
  };

  protected readonly isGameOver = () => {
    this.chessState.fen();
    this.chessState.forcedResult();
    return this.engine.isGameOver();
  };

  constructor() {
    effect(() => {
      const message = this.chessState.message();
      if (message && message !== this.lastPokemonMessage) {
        this.lastPokemonMessage = message;
        void this.alert.toast('warning', message);
      }

      if (!message) {
        this.lastPokemonMessage = null;
      }
    });

    effect(() => {
      this.chessState.fen();
      this.chessState.forcedResult();
      const status = this.engine.getStatusMessage();
      const gameOver = this.engine.isGameOver();

      if (status && status !== this.lastStatusMessage) {
        this.lastStatusMessage = status;

        if (gameOver) {
          void this.alert.info('Fin de la partida', status);
        } else if (status === 'Jaque.') {
          void this.alert.toast('info', status);
        }
      }

      if (!status) {
        this.lastStatusMessage = null;
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.currentMode = params.get('mode') === 'local' ? 'local' : 'ai';
      this.startNewGame(this.currentMode);
    });
  }

  protected newGame(): void {
    this.lastPokemonMessage = null;
    this.lastStatusMessage = null;
    this.engine.newGame(this.currentMode);
  }

  private startNewGame(mode: GameMode): void {
    this.pieceService.loadPieces().subscribe({
      next: () => this.engine.newGame(mode),
      error: () => {
        void this.alert.error('No se pudieron cargar las piezas.');
        this.engine.newGame(mode);
      },
    });
  }
}
