import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { AdminStateService } from '../../../core/services/admin-state.service';
import { AlertService } from '../../../core/services/alert.service';
import { PokeApiService } from '../../../core/services/poke-api.service';
import { CHESS_PIECE_TYPES, ChessPieceType } from '../../../shared/models/chess-piece-type';
import { AdminPieceForm } from '../../../shared/models/admin-piece.model';
import { PieceSide } from '../../../shared/models/piece.model';
import { POKEMON_TYPES, PokemonType } from '../../../shared/models/pokemon-type';
import { Piece } from '../../../shared/models/piece.model';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';

@Component({
  selector: 'app-admin-pieces',
  imports: [ReactiveFormsModule, AdminNavComponent],
  templateUrl: './admin-pieces.component.html',
  styleUrl: './admin-pieces.component.scss',
})
export class AdminPiecesComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly adminState = inject(AdminStateService);
  private readonly alert = inject(AlertService);
  private readonly pokeApi = inject(PokeApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pieces = this.adminState.pieces;
  protected readonly loading = this.adminState.loading;
  protected readonly editingId = signal<number | null>(null);
  protected readonly spritePreview = signal<string | null>(null);
  protected readonly fetchingSprite = signal(false);

  protected readonly sides: PieceSide[] = ['white', 'black'];
  protected readonly chessTypes = CHESS_PIECE_TYPES;
  protected readonly pokemonTypes = POKEMON_TYPES;

  protected readonly form = this.fb.group({
    side: ['white' as PieceSide, [Validators.required]],
    chess_type: ['pawn' as ChessPieceType, [Validators.required]],
    pokemon_name: ['', [Validators.required, Validators.maxLength(255)]],
    pokemon_type: ['normal' as PokemonType, [Validators.required]],
    sprite_url: ['', [Validators.required, Validators.maxLength(2048)]],
  });

  ngOnInit(): void {
    this.startCreate();
    this.adminService.loadPieces().subscribe({
      error: () => void this.alert.error('No se pudieron cargar las piezas.'),
    });

    this.form.controls.pokemon_name.valueChanges
      .pipe(
        debounceTime(450),
        distinctUntilChanged(),
        filter((name) => name.trim().length > 0),
        switchMap((name) => {
          this.fetchingSprite.set(true);
          return this.pokeApi.fetchSpriteUrl(name);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (url) => {
          this.form.controls.sprite_url.setValue(url);
          this.spritePreview.set(url);
          this.fetchingSprite.set(false);
        },
        error: () => {
          this.form.controls.sprite_url.setValue('');
          this.spritePreview.set(null);
          this.fetchingSprite.set(false);
          void this.alert.warning('No se encontró sprite', 'Revisa el nombre del Pokémon.');
        },
      });
  }

  protected startCreate(): void {
    this.editingId.set(null);
    this.spritePreview.set(null);
    this.form.reset({
      side: 'white',
      chess_type: 'pawn',
      pokemon_name: '',
      pokemon_type: 'normal',
      sprite_url: '',
    });
  }

  protected startEdit(piece: Piece): void {
    this.editingId.set(piece.id);
    this.spritePreview.set(piece.sprite_url);
    this.form.patchValue({
      side: piece.side,
      chess_type: piece.chess_type,
      pokemon_name: piece.pokemon_name,
      pokemon_type: piece.pokemon_type,
      sprite_url: piece.sprite_url,
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.controls.sprite_url.invalid) {
        void this.alert.warning('Sprite pendiente', 'Espera a que se cargue el sprite del Pokémon.');
      }
      return;
    }

    const payload = this.form.getRawValue() as AdminPieceForm;
    const editingId = this.editingId();

    if (editingId === null) {
      this.adminService.createPiece(payload).subscribe({
        next: () => {
          void this.alert.success('Pieza creada.');
          this.startCreate();
        },
        error: (error) => void this.alert.showHttpError(error),
      });
      return;
    }

    this.adminService.updatePiece(editingId, payload).subscribe({
      next: () => {
        void this.alert.success('Pieza actualizada.');
        this.startCreate();
      },
      error: (error) => void this.alert.showHttpError(error),
    });
  }

  protected async deletePiece(piece: Piece): Promise<void> {
    const confirmed = await this.alert.confirm(
      'Eliminar pieza',
      `¿Eliminar ${piece.pokemon_name} (${piece.side} ${piece.chess_type})?`,
    );

    if (!confirmed) {
      return;
    }

    this.adminService.deletePiece(piece.id).subscribe({
      next: () => void this.alert.success('Pieza eliminada.'),
      error: (error) => void this.alert.showHttpError(error),
    });
  }
}
