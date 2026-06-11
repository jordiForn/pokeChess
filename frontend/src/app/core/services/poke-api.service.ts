import { Injectable } from '@angular/core';
import { Piece } from '../../shared/models/piece.model';

const CACHE_PREFIX = 'pokechess_sprite_';

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  prefetchSprites(pieces: Piece[]): void {
    for (const piece of pieces) {
      void this.ensureSprite(piece.pokemon_name, piece.sprite_url);
    }
  }

  getCachedSprite(pokemonName: string, fallbackUrl: string): string {
    const cached = localStorage.getItem(this.cacheKey(pokemonName));
    if (cached) {
      return cached;
    }

    localStorage.setItem(this.cacheKey(pokemonName), fallbackUrl);
    return fallbackUrl;
  }

  private async ensureSprite(pokemonName: string, fallbackUrl: string): Promise<void> {
    const key = this.cacheKey(pokemonName);
    const cached = localStorage.getItem(key);
    if (cached) {
      return;
    }

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemonName.toLowerCase())}`,
      );

      if (!response.ok) {
        throw new Error('PokeAPI request failed');
      }

      const data = (await response.json()) as {
        sprites?: {
          front_default?: string | null;
          other?: { 'official-artwork'?: { front_default?: string | null } };
        };
      };

      const url =
        data.sprites?.other?.['official-artwork']?.front_default ??
        data.sprites?.front_default ??
        fallbackUrl;

      localStorage.setItem(key, url);
    } catch {
      localStorage.setItem(key, fallbackUrl);
    }
  }

  private cacheKey(pokemonName: string): string {
    return `${CACHE_PREFIX}${pokemonName.toLowerCase()}`;
  }
}
