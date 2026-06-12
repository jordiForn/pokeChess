import { Injectable, inject } from '@angular/core';
import { Chess, Color, Move, PieceSymbol, Square } from 'chess.js';
import {
  BoardPieceView,
  BoardSquareView,
  CHESS_SYMBOL_TO_TYPE,
  ChessMoveView,
} from '../../shared/models/chess-board.model';
import { PieceSide } from '../../shared/models/piece.model';
import { ChessStateService } from './chess-state.service';
import { ChessAiService } from './chess-ai.service';
import { GameStateService } from './game-state.service';
import { PieceInventoryService } from './piece-inventory.service';
import { StatsService } from './stats.service';
import { TypeEffectivenessService } from './type-effectiveness.service';
import { VercelObservabilityService } from './vercel-observability.service';
import { GameResult } from '../../shared/models/game-result.model';
import { GameMode } from '../../shared/models/game-mode.model';
import { PROMOTION_OPTIONS, PromotionOptionView } from '../../shared/models/promotion.model';
import { BoardColor } from './chess-state.service';

const PIECE_SYMBOLS: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const COLOR_TO_SIDE: Record<Color, PieceSide> = {
  w: 'white',
  b: 'black',
};

@Injectable({ providedIn: 'root' })
export class ChessEngineService {
  private readonly chessState = inject(ChessStateService);
  private readonly gameState = inject(GameStateService);
  private readonly typeEffectiveness = inject(TypeEffectivenessService);
  private readonly aiService = inject(ChessAiService);
  private readonly statsService = inject(StatsService);
  private readonly inventory = inject(PieceInventoryService);
  private readonly observability = inject(VercelObservabilityService);

  private chess = new Chess();
  private aiMoveTimeout: number | null = null;

  newGame(mode: GameMode = 'ai'): void {
    this.clearAiSchedule();
    this.gameState.setAiThinking(false);
    this.chess.reset();
    this.chessState.reset();
    const playerColor = mode === 'ai' ? this.randomPlayerColor() : 'w';
    this.gameState.startGame(mode, playerColor);
    this.inventory.initialize(this.chess, this.chessState.piecesConfig());
    this.syncState();
    this.scheduleAiTurnIfNeeded();
    this.trackGameStart(mode, playerColor);
  }

  isPlayerTurn(): boolean {
    if (!this.gameState.vsAi()) {
      return true;
    }

    return this.chess.turn() === this.gameState.playerColor();
  }

  canInteract(): boolean {
    return (
      !this.gameState.aiThinking() &&
      !this.chessState.pendingPromotion() &&
      this.isPlayerTurn() &&
      !this.isGameOver()
    );
  }

  getBoardSquares(): BoardSquareView[] {
    const squares: BoardSquareView[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        const notation = `${file}${rank}` as Square;
        const piece = this.chess.get(notation);

        squares.push({
          row,
          col,
          notation,
          fileLabel: file,
          rankLabel: String(rank),
          isLight: (row + col) % 2 === 0,
          piece: piece ? this.toBoardPiece(piece.color, piece.type) : null,
        });
      }
    }

    return squares;
  }

  selectSquare(notation: string): void {
    if (!this.canInteract()) {
      return;
    }

    if (this.isGameOver()) {
      return;
    }

    const selected = this.chessState.selectedSquare();

    if (selected === notation) {
      this.clearSelection();
      return;
    }

    if (selected) {
      const moved = this.tryMove(selected, notation);
      if (moved) {
        return;
      }
    }

    const piece = this.chess.get(notation as Square);
    if (!piece || piece.color !== this.chess.turn()) {
      this.clearSelection();
      return;
    }

    const legalMoves = this.chess.moves({ square: notation as Square, verbose: true }) as Move[];
    this.chessState.selectSquare(notation);
    this.chessState.setLegalMoves(
      legalMoves.map((move) => ({
        from: move.from,
        to: move.to,
        san: move.san,
      })),
    );
  }

  tryMove(from: string, to: string, promotion?: PieceSymbol): ChessMoveView | null {
    if (this.isGameOver()) {
      return null;
    }

    const verboseMoves = this.chess.moves({ square: from as Square, verbose: true }) as Move[];
    const candidates = verboseMoves.filter((move) => move.to === to);

    if (candidates.length === 0) {
      return null;
    }

    const isPromotion = candidates.some((move) => move.flags.includes('p'));

    if (isPromotion && !promotion) {
      const sample = candidates[0];

      if (this.isCaptureMove(sample)) {
        const attacker = this.getPokemonAt(from as Square);
        const defenderSquare = this.getCaptureTargetSquare(from, to, sample);
        const defender = defenderSquare ? this.getPokemonAt(defenderSquare) : null;

        if (attacker && defender) {
          const blockReason = this.typeEffectiveness.getCaptureBlockReason(
            attacker.pokemon_type,
            defender.pokemon_type,
          );

          if (blockReason) {
            this.handleImmuneCapture(
              from,
              to,
              attacker.pokemon_name,
              defender.pokemon_name,
              blockReason,
            );
            return null;
          }
        }
      }

      this.chessState.setPendingPromotion({ from, to });
      this.clearSelection();
      return null;
    }

    const candidate = isPromotion
      ? candidates.find((move) => move.promotion === promotion) ?? null
      : candidates[0];

    if (!candidate) {
      return null;
    }

    if (this.isCaptureMove(candidate)) {
      const attacker = this.getPokemonAt(from as Square);
      const defenderSquare = this.getCaptureTargetSquare(from, to, candidate);
      const defender = defenderSquare ? this.getPokemonAt(defenderSquare) : null;

      if (attacker && defender) {
        const blockReason = this.typeEffectiveness.getCaptureBlockReason(
          attacker.pokemon_type,
          defender.pokemon_type,
        );

        if (blockReason) {
          this.handleImmuneCapture(from, to, attacker.pokemon_name, defender.pokemon_name, blockReason);
          return null;
        }
      }
    }

    const move = this.chess.move({
      from: from as Square,
      to: to as Square,
      promotion: isPromotion ? promotion : undefined,
    });

    if (!move) {
      return null;
    }

    this.chessState.setMessage(null);
    this.clearSelection();
    this.registerInventoryCapture(move);
    this.syncState({
      from: move.from,
      to: move.to,
      san: move.san,
    });
    this.scheduleAiTurnIfNeeded();

    return {
      from: move.from,
      to: move.to,
      san: move.san,
    };
  }

  getTurnLabel(): string {
    return this.chess.turn() === 'w' ? 'Blancas' : 'Negras';
  }

  isCheck(): boolean {
    return this.chess.inCheck();
  }

  isGameOver(): boolean {
    return this.chess.isGameOver() || this.chessState.forcedResult() !== null;
  }

  getPromotionOptions(): PromotionOptionView[] {
    const pending = this.chessState.pendingPromotion();
    if (!pending) {
      return [];
    }

    const piece = this.chess.get(pending.from as Square);
    if (!piece) {
      return [];
    }

    return PROMOTION_OPTIONS.map((option) => ({
      piece: option.piece,
      label: option.label,
      pokemon: this.toBoardPiece(piece.color, option.piece).pokemon,
    }));
  }

  completePromotion(piece: PieceSymbol): void {
    const pending = this.chessState.pendingPromotion();
    if (!pending) {
      return;
    }

    this.chessState.setPendingPromotion(null);
    this.tryMove(pending.from, pending.to, piece);
  }

  getStatusMessage(): string | null {
    const forced = this.chessState.forcedResult();
    if (forced) {
      return forced.message;
    }

    if (this.chess.isCheckmate()) {
      const winner = this.chess.turn() === 'w' ? 'Negras' : 'Blancas';
      return `Jaque mate. Ganan ${winner}.`;
    }

    if (this.chess.isStalemate()) {
      return 'Tablas por ahogado.';
    }

    if (this.chess.isDraw()) {
      if (this.chess.isInsufficientMaterial()) {
        return 'Tablas por material insuficiente.';
      }

      if (this.chess.isStalemate()) {
        return 'Tablas por ahogado.';
      }

      return 'Tablas.';
    }

    if (this.chess.inCheck()) {
      return 'Jaque.';
    }

    return null;
  }

  private toBoardPiece(color: Color, type: PieceSymbol): BoardPieceView {
    const config = this.findPieceConfig(color, type);

    return {
      color,
      type,
      symbol: PIECE_SYMBOLS[color][type],
      pokemon: config
        ? {
            name: config.pokemon_name,
            type: config.pokemon_type,
            spriteUrl: config.sprite_url,
          }
        : null,
    };
  }

  private findPieceConfig(color: Color, type: PieceSymbol) {
    const side = COLOR_TO_SIDE[color];
    const chessType = CHESS_SYMBOL_TO_TYPE[type];

    return this.chessState.piecesConfig().find(
      (piece) => piece.side === side && piece.chess_type === chessType,
    );
  }

  private getPokemonAt(square: Square) {
    const piece = this.chess.get(square);
    if (!piece) {
      return null;
    }

    return this.findPieceConfig(piece.color, piece.type) ?? null;
  }

  private isCaptureMove(move: Move): boolean {
    return move.isCapture() || move.isEnPassant();
  }

  private getCaptureTargetSquare(from: string, to: string, move: Move): Square | null {
    if (move.isEnPassant()) {
      const file = to[0];
      const toRank = Number(to[1]);
      const fromRank = Number(from[1]);
      const captureRank = fromRank > toRank ? toRank + 1 : toRank - 1;
      return `${file}${captureRank}` as Square;
    }

    return to as Square;
  }

  private handleImmuneCapture(
    from: string,
    to: string,
    attackerName: string,
    defenderName: string,
    blockReason: string,
  ): void {
    const wasInCheck = this.chess.inCheck();
    const movingColor = this.chess.turn();

    this.chessState.setMessage(`¡${defenderName} es inmune a ${attackerName}! ${blockReason}`);
    this.chessState.setInvalidCaptureSquare(to);
    this.clearSelection();

    if (wasInCheck) {
      this.applyCheckmateFromImmunity(movingColor);
      this.syncState();
      window.setTimeout(() => {
        this.chessState.setInvalidCaptureSquare(null);
      }, 900);
      return;
    }

    this.passTurn();
    this.syncState();
    this.scheduleAiTurnIfNeeded();

    window.setTimeout(() => {
      this.chessState.setInvalidCaptureSquare(null);
    }, 900);
  }

  private passTurn(): void {
    const [placement, turn, castling, enPassant, half, full] = this.chess.fen().split(' ');
    const nextTurn = turn === 'w' ? 'b' : 'w';
    const nextHalf = String(Number(half) + 1);
    const nextFull = turn === 'b' ? String(Number(full) + 1) : full;

    this.chess.load(
      `${placement} ${nextTurn} ${castling} ${enPassant} ${nextHalf} ${nextFull}`,
      { skipValidation: true },
    );
  }

  private clearSelection(): void {
    this.chessState.selectSquare(null);
    this.chessState.setLegalMoves([]);
  }

  private registerInventoryCapture(move: Move): void {
    const piecesConfig = this.chessState.piecesConfig();
    const capturedType = move.captured ?? (move.flags.includes('e') ? 'p' : null);

    if (capturedType) {
      this.inventory.registerCapture(move.color, capturedType, piecesConfig);
    }

    this.inventory.syncFromBoard(this.chess, piecesConfig);
  }

  private syncState(lastMove?: ChessMoveView): void {
    this.chessState.setFen(this.chess.fen());
    this.chessState.setTurn(this.chess.turn());
    this.chessState.setLastMove(lastMove ?? null);

    if (this.chessState.forcedResult()) {
      return;
    }

    if (this.chess.isCheckmate()) {
      this.gameState.setStatus('checkmate');
      this.recordStatsIfNeeded();
      return;
    }

    if (this.chess.isStalemate()) {
      this.gameState.setStatus('stalemate');
      this.recordStatsIfNeeded();
      return;
    }

    if (this.chess.isDraw()) {
      this.gameState.setStatus('draw');
      this.recordStatsIfNeeded();
      return;
    }

    this.evaluateEndgameConditions();

    if (!this.isGameOver()) {
      this.gameState.setStatus('playing');
    }
  }

  private evaluateEndgameConditions(): void {
    if (this.isGameOver()) {
      return;
    }

    if (this.shouldEndByInsufficientMaterial()) {
      this.applyDraw('Tablas por material insuficiente.');
    }
  }

  private shouldEndByInsufficientMaterial(): boolean {
    if (this.chess.isInsufficientMaterial()) {
      return true;
    }

    const material = this.countMaterial();

    return (
      material.pawns === 0 &&
      material.knights === 0 &&
      material.rooks === 0 &&
      material.queens === 0 &&
      material.bishops === 2
    );
  }

  private countMaterial(): {
    pawns: number;
    knights: number;
    bishops: number;
    rooks: number;
    queens: number;
  } {
    const counts = { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 };

    for (const row of this.chess.board()) {
      for (const piece of row) {
        if (!piece) {
          continue;
        }

        switch (piece.type) {
          case 'p':
            counts.pawns++;
            break;
          case 'n':
            counts.knights++;
            break;
          case 'b':
            counts.bishops++;
            break;
          case 'r':
            counts.rooks++;
            break;
          case 'q':
            counts.queens++;
            break;
        }
      }
    }

    return counts;
  }

  private applyCheckmateFromImmunity(losingColor: Color): void {
    const winner: BoardColor = losingColor === 'w' ? 'b' : 'w';
    const winnerLabel = winner === 'w' ? 'Blancas' : 'Negras';

    this.chessState.setForcedResult({
      type: 'checkmate',
      winner,
      message: `Jaque mate. Ganan ${winnerLabel}.`,
    });
    this.gameState.setStatus('checkmate');
    this.recordStatsIfNeeded();
  }

  private applyDraw(message: string): void {
    if (this.chessState.forcedResult()) {
      return;
    }

    this.chessState.setForcedResult({
      type: 'draw',
      message,
    });
    this.gameState.setStatus('draw');
    this.recordStatsIfNeeded();
  }

  private recordStatsIfNeeded(): void {
    if (!this.gameState.vsAi() || this.gameState.statsRecorded()) {
      return;
    }

    this.gameState.setStatsRecorded(true);

    const forced = this.chessState.forcedResult();
    let result: GameResult;

    if (forced?.type === 'checkmate') {
      const playerLost = forced.winner !== this.gameState.playerColor();
      result = playerLost ? 'loss' : 'win';
    } else if (forced?.type === 'draw' || this.chess.isDraw() || this.chess.isStalemate()) {
      result = 'draw';
    } else if (this.chess.isCheckmate()) {
      const playerLost = this.chess.turn() === this.gameState.playerColor();
      result = playerLost ? 'loss' : 'win';
    } else {
      result = 'draw';
    }

    this.statsService.recordResult(result).subscribe();
    this.observability.trackEvent('game_end', {
      mode: this.gameState.vsAi() ? 'ai' : 'local',
      result,
    });
  }

  private scheduleAiTurnIfNeeded(): void {
    if (this.isGameOver() || !this.gameState.vsAi() || this.isPlayerTurn()) {
      return;
    }

    this.clearAiSchedule();
    this.gameState.setAiThinking(true);

    this.aiMoveTimeout = window.setTimeout(() => {
      this.playAiMove();
      this.gameState.setAiThinking(false);
      this.aiMoveTimeout = null;
    }, 450);
  }

  private playAiMove(): void {
    if (this.isGameOver() || this.isPlayerTurn()) {
      return;
    }

    const aiColor = this.gameState.playerColor() === 'w' ? 'b' : 'w';
    const move = this.aiService.chooseMove(this.chess, this.chessState.piecesConfig(), aiColor, 2);

    if (!move) {
      return;
    }

    this.tryMove(move.from, move.to, move.promotion ?? 'q');
  }

  private clearAiSchedule(): void {
    if (this.aiMoveTimeout !== null) {
      window.clearTimeout(this.aiMoveTimeout);
      this.aiMoveTimeout = null;
    }
  }

  private randomPlayerColor(): BoardColor {
    return Math.random() < 0.5 ? 'w' : 'b';
  }

  private trackGameStart(mode: GameMode, playerColor: BoardColor): void {
    this.observability.trackEvent('game_start', {
      mode,
      player_color: playerColor,
    });
  }
}
