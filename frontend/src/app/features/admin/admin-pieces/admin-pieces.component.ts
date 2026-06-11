import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AdminStateService } from '../../../core/services/admin-state.service';
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

  protected readonly pieces = this.adminState.pieces;
  protected readonly loading = this.adminState.loading;
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

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
      error: () => this.errorMessage.set('No se pudieron cargar las piezas.'),
    });
  }

  protected startCreate(): void {
    this.editingId.set(null);
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
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = this.form.getRawValue() as AdminPieceForm;
    const editingId = this.editingId();

    if (editingId === null) {
      this.adminService.createPiece(payload).subscribe({
        next: () => {
          this.successMessage.set('Pieza creada.');
          this.startCreate();
        },
        error: (error) => this.errorMessage.set(this.extractError(error)),
      });
      return;
    }

    this.adminService.updatePiece(editingId, payload).subscribe({
      next: () => {
        this.successMessage.set('Pieza actualizada.');
        this.startCreate();
      },
      error: (error) => this.errorMessage.set(this.extractError(error)),
    });
  }

  protected deletePiece(piece: Piece): void {
    if (!confirm(`¿Eliminar ${piece.pokemon_name} (${piece.side} ${piece.chess_type})?`)) {
      return;
    }

    this.adminService.deletePiece(piece.id).subscribe({
      next: () => this.successMessage.set('Pieza eliminada.'),
      error: (error) => this.errorMessage.set(this.extractError(error)),
    });
  }

  private extractError(error: { error?: { message?: string; errors?: Record<string, string[]> } }): string {
    const validationError = error?.error?.errors;
    if (validationError) {
      return Object.values(validationError)[0]?.[0] ?? 'Error de validación.';
    }

    return error?.error?.message ?? 'Operación fallida.';
  }
}
