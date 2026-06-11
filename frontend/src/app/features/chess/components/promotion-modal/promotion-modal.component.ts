import { Component, computed, inject } from '@angular/core';
import { PieceSymbol } from 'chess.js';
import { ChessEngineService } from '../../../../core/services/chess-engine.service';
import { ChessStateService } from '../../../../core/services/chess-state.service';

@Component({
  selector: 'app-promotion-modal',
  templateUrl: './promotion-modal.component.html',
  styleUrl: './promotion-modal.component.scss',
})
export class PromotionModalComponent {
  private readonly engine = inject(ChessEngineService);
  private readonly chessState = inject(ChessStateService);

  protected readonly pendingPromotion = this.chessState.pendingPromotion;

  protected readonly options = computed(() => {
    this.chessState.pendingPromotion();
    return this.engine.getPromotionOptions();
  });

  protected select(piece: PieceSymbol): void {
    this.engine.completePromotion(piece);
  }
}
