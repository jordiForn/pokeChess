import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Piece } from '../../shared/models/piece.model';
import { ChessStateService } from './chess-state.service';
import { PokeApiService } from './poke-api.service';

@Injectable({ providedIn: 'root' })
export class PieceService {
  private readonly http = inject(HttpClient);
  private readonly chessState = inject(ChessStateService);
  private readonly pokeApi = inject(PokeApiService);

  private readonly apiUrl = `${environment.apiUrl}/v1`;

  loadPieces(): Observable<Piece[]> {
    return this.http.get<{ data: Piece[] }>(`${this.apiUrl}/pieces`).pipe(
      map(({ data }) =>
        data.map((piece) => ({
          ...piece,
          sprite_url: this.pokeApi.getCachedSprite(piece.pokemon_name, piece.sprite_url),
        })),
      ),
      tap((pieces) => {
        this.chessState.setPiecesConfig(pieces);
        this.pokeApi.prefetchSprites(pieces);
      }),
    );
  }
}
