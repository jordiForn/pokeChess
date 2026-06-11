import { Injectable, inject } from '@angular/core';
import { Chess, Color, Move, PieceSymbol, Square, SQUARES } from 'chess.js';
import {
  CHESS_SYMBOL_TO_TYPE,
} from '../../shared/models/chess-board.model';
import { Piece, PieceSide } from '../../shared/models/piece.model';
import { TypeEffectivenessService } from './type-effectiveness.service';

const MATERIAL: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const COLOR_TO_SIDE: Record<Color, PieceSide> = {
  w: 'white',
  b: 'black',
};

@Injectable({ providedIn: 'root' })
export class ChessAiService {
  private readonly typeEffectiveness = inject(TypeEffectivenessService);

  chooseMove(chess: Chess, piecesConfig: Piece[], aiColor: Color, depth = 2): Move | null {
    const moves = this.getValidMoves(chess, piecesConfig);
    if (moves.length === 0) {
      return null;
    }

    if (depth <= 1) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMoves: Move[] = [];

    for (const move of moves) {
      const clone = new Chess(chess.fen());
      clone.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion ?? 'q',
      });

      const score = this.search(clone, piecesConfig, aiColor, depth - 1);

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? null;
  }

  private search(chess: Chess, piecesConfig: Piece[], aiColor: Color, depth: number): number {
    if (depth === 0 || chess.isGameOver()) {
      return this.evaluate(chess, aiColor);
    }

    const moves = this.getValidMoves(chess, piecesConfig);
    if (moves.length === 0) {
      return this.evaluate(chess, aiColor);
    }

    const maximizing = chess.turn() === aiColor;

    if (maximizing) {
      return Math.max(
        ...moves.map((move) => {
          const clone = new Chess(chess.fen());
          clone.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion ?? 'q',
          });
          return this.search(clone, piecesConfig, aiColor, depth - 1);
        }),
      );
    }

    return Math.min(
      ...moves.map((move) => {
        const clone = new Chess(chess.fen());
        clone.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion ?? 'q',
        });
        return this.search(clone, piecesConfig, aiColor, depth - 1);
      }),
    );
  }

  private evaluate(chess: Chess, aiColor: Color): number {
    if (chess.isCheckmate()) {
      return chess.turn() === aiColor ? -100000 : 100000;
    }

    if (chess.isDraw() || chess.isStalemate()) {
      return 0;
    }

    let score = 0;

    for (const square of SQUARES) {
      const piece = chess.get(square);
      if (!piece) {
        continue;
      }

      const value = MATERIAL[piece.type];
      score += piece.color === aiColor ? value : -value;
    }

    if (chess.inCheck()) {
      score += chess.turn() === aiColor ? -50 : 50;
    }

    return score;
  }

  private getValidMoves(chess: Chess, piecesConfig: Piece[]): Move[] {
    const moves = chess.moves({ verbose: true }) as Move[];

    return moves.filter((move) => !this.isImmuneCapture(chess, move, piecesConfig));
  }

  private isImmuneCapture(chess: Chess, move: Move, piecesConfig: Piece[]): boolean {
    if (!move.isCapture() && !move.isEnPassant()) {
      return false;
    }

    const attacker = this.getPokemonConfig(chess, move.from, piecesConfig);
    const defenderSquare = this.getCaptureTargetSquare(move);
    const defender = defenderSquare
      ? this.getPokemonConfig(chess, defenderSquare, piecesConfig)
      : null;

    if (!attacker || !defender) {
      return false;
    }

    return this.typeEffectiveness.isImmune(attacker.pokemon_type, defender.pokemon_type);
  }

  private getCaptureTargetSquare(move: Move): Square {
    if (move.isEnPassant()) {
      const file = move.to[0];
      const toRank = Number(move.to[1]);
      const fromRank = Number(move.from[1]);
      const captureRank = fromRank > toRank ? toRank + 1 : toRank - 1;
      return `${file}${captureRank}` as Square;
    }

    return move.to;
  }

  private getPokemonConfig(chess: Chess, square: Square, piecesConfig: Piece[]) {
    const piece = chess.get(square);
    if (!piece) {
      return null;
    }

    const side = COLOR_TO_SIDE[piece.color];
    const chessType = CHESS_SYMBOL_TO_TYPE[piece.type];

    return (
      piecesConfig.find(
        (config) => config.side === side && config.chess_type === chessType,
      ) ?? null
    );
  }
}
