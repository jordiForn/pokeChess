import { Injectable, signal } from '@angular/core';
import { Piece } from '../../shared/models/piece.model';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminStateService {
  private readonly usersSignal = signal<User[]>([]);
  private readonly piecesSignal = signal<Piece[]>([]);
  private readonly loadingSignal = signal(false);

  readonly users = this.usersSignal.asReadonly();
  readonly pieces = this.piecesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  setUsers(users: User[]): void {
    this.usersSignal.set(users);
  }

  setPieces(pieces: Piece[]): void {
    this.piecesSignal.set(pieces);
  }

  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  clear(): void {
    this.usersSignal.set([]);
    this.piecesSignal.set([]);
    this.loadingSignal.set(false);
  }
}
