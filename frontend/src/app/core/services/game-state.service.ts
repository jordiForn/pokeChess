import { computed, Injectable, signal } from '@angular/core';
import { GameMode } from '../../shared/models/game-mode.model';

export type GameStatus = 'idle' | 'playing' | 'checkmate' | 'stalemate' | 'draw';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly statusSignal = signal<GameStatus>('idle');
  private readonly modeSignal = signal<GameMode>('ai');
  private readonly playerColorSignal = signal<'w' | 'b'>('w');
  private readonly aiThinkingSignal = signal(false);
  private readonly statsRecordedSignal = signal(false);

  readonly status = this.statusSignal.asReadonly();
  readonly mode = this.modeSignal.asReadonly();
  readonly vsAi = computed(() => this.modeSignal() === 'ai');
  readonly playerColor = this.playerColorSignal.asReadonly();
  readonly aiThinking = this.aiThinkingSignal.asReadonly();
  readonly statsRecorded = this.statsRecordedSignal.asReadonly();

  startGame(mode: GameMode = 'ai', playerColor: 'w' | 'b' = 'w'): void {
    this.modeSignal.set(mode);
    this.playerColorSignal.set(playerColor);
    this.statsRecordedSignal.set(false);
    this.statusSignal.set('playing');
  }

  setStatsRecorded(recorded: boolean): void {
    this.statsRecordedSignal.set(recorded);
  }

  setStatus(status: GameStatus): void {
    this.statusSignal.set(status);
  }

  setAiThinking(thinking: boolean): void {
    this.aiThinkingSignal.set(thinking);
  }

  reset(): void {
    this.statusSignal.set('idle');
    this.modeSignal.set('ai');
    this.playerColorSignal.set('w');
    this.aiThinkingSignal.set(false);
    this.statsRecordedSignal.set(false);
  }
}
