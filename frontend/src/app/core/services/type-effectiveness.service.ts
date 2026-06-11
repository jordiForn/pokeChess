import { Injectable } from '@angular/core';
import { PokemonType } from '../../shared/models/pokemon-type';

@Injectable({ providedIn: 'root' })
export class TypeEffectivenessService {
  isImmune(attacker: PokemonType, defender: PokemonType): boolean {
    if (attacker === 'normal' && defender === 'ghost') {
      return true;
    }

    if (attacker === 'fighting' && defender === 'ghost') {
      return true;
    }

    if (attacker === 'ghost' && defender === 'normal') {
      return true;
    }

    return false;
  }

  isSuperEffective(attacker: PokemonType, defender: PokemonType): boolean {
    return attacker === 'fighting' && defender === 'normal';
  }

  getCaptureBlockReason(attacker: PokemonType, defender: PokemonType): string | null {
    if (!this.isImmune(attacker, defender)) {
      return null;
    }

    return `Inmunidad de tipos (${attacker} → ${defender}). Pierdes el turno.`;
  }
}
