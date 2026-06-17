import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap, throwError } from 'rxjs';
import { Piece } from '../../shared/models/piece.model';

const CACHE_PREFIX = 'pokechess_sprite_';
const POKEAPI_BASE = 'https://pokeapi.co/api/v2/pokemon';

interface PokeApiPokemonResponse {
  sprites?: {
    front_default?: string | null;
    other?: { 'official-artwork'?: { front_default?: string | null } };
  };
}

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private readonly http = inject(HttpClient);

  prefetchSprites(pieces: Piece[]): void {
    for (const piece of pieces) {
      if (this.isLocalSprite(piece.sprite_url)) {
        continue;
      }
      void this.ensureSprite(piece.pokemon_name, piece.sprite_url);
    }
  }

  getCachedSprite(pokemonName: string, fallbackUrl: string): string {
    if (this.isLocalSprite(fallbackUrl)) {
      return fallbackUrl;
    }

    const cached = localStorage.getItem(this.cacheKey(pokemonName));
    if (cached) {
      return cached;
    }

    localStorage.setItem(this.cacheKey(pokemonName), fallbackUrl);
    return fallbackUrl;
  }

  fetchSpriteUrl(pokemonName: string): Observable<string> {
    const normalized = pokemonName.trim().toLowerCase();
    if (!normalized) {
      return throwError(() => new Error('Introduce un nombre de Pokémon.'));
    }

    const cached = localStorage.getItem(this.cacheKey(normalized));
    if (cached) {
      return of(cached);
    }

    return this.http.get<PokeApiPokemonResponse>(`${POKEAPI_BASE}/${encodeURIComponent(normalized)}`).pipe(
      map((data) => this.extractSpriteUrl(data)),
      tap((url) => localStorage.setItem(this.cacheKey(normalized), url)),
    );
  }

  private async ensureSprite(pokemonName: string, fallbackUrl: string): Promise<void> {
    if (this.isLocalSprite(fallbackUrl)) {
      return;
    }

    const key = this.cacheKey(pokemonName);
    const cached = localStorage.getItem(key);
    if (cached) {
      return;
    }

    try {
      const response = await fetch(`${POKEAPI_BASE}/${encodeURIComponent(pokemonName.toLowerCase())}`);

      if (!response.ok) {
        throw new Error('PokeAPI request failed');
      }

      const data = (await response.json()) as PokeApiPokemonResponse;
      const url = this.extractSpriteUrl(data, fallbackUrl);
      localStorage.setItem(key, url);
    } catch {
      localStorage.setItem(key, fallbackUrl);
    }
  }

  private isLocalSprite(url: string): boolean {
    return url.startsWith('/sprites/');
  }

  private extractSpriteUrl(data: PokeApiPokemonResponse, fallbackUrl?: string): string {
    const url =
      data.sprites?.other?.['official-artwork']?.front_default ??
      data.sprites?.front_default ??
      fallbackUrl;

    if (!url) {
      throw new Error('No se encontró sprite para ese Pokémon.');
    }

    return url;
  }

  private cacheKey(pokemonName: string): string {
    return `${CACHE_PREFIX}${pokemonName.toLowerCase()}`;
  }
}
