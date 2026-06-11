import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminPieceForm } from '../../shared/models/admin-piece.model';
import { AdminUserForm, AdminUserUpdateForm } from '../../shared/models/admin-user.model';
import { Piece } from '../../shared/models/piece.model';
import { User } from '../../shared/models/user.model';
import { AdminStateService } from './admin-state.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly adminState = inject(AdminStateService);

  private readonly apiUrl = `${environment.apiUrl}/v1/admin`;

  loadUsers(): Observable<User[]> {
    this.adminState.setLoading(true);

    return this.http.get<{ data: User[] }>(`${this.apiUrl}/users`).pipe(
      map(({ data }) => data),
      tap((users) => this.adminState.setUsers(users)),
      finalize(() => this.adminState.setLoading(false)),
    );
  }

  createUser(payload: AdminUserForm): Observable<User> {
    return this.http.post<{ user: User }>(`${this.apiUrl}/users`, payload).pipe(
      map(({ user }) => user),
      tap((user) => this.adminState.setUsers([...this.adminState.users(), user])),
    );
  }

  updateUser(id: number, payload: AdminUserUpdateForm): Observable<User> {
    const body: Record<string, unknown> = {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      avatar: payload.avatar,
    };

    if (payload.password.trim() !== '') {
      body['password'] = payload.password;
      body['password_confirmation'] = payload.password_confirmation;
    }

    return this.http.put<{ user: User }>(`${this.apiUrl}/users/${id}`, body).pipe(
      map(({ user }) => user),
      tap((user) =>
        this.adminState.setUsers(
          this.adminState.users().map((existing) => (existing.id === id ? user : existing)),
        ),
      ),
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${id}`).pipe(
      tap(() =>
        this.adminState.setUsers(this.adminState.users().filter((user) => user.id !== id)),
      ),
      map(() => undefined),
    );
  }

  loadPieces(): Observable<Piece[]> {
    this.adminState.setLoading(true);

    return this.http.get<{ data: Piece[] }>(`${this.apiUrl}/pieces`).pipe(
      map(({ data }) => data),
      tap((pieces) => this.adminState.setPieces(pieces)),
      finalize(() => this.adminState.setLoading(false)),
    );
  }

  createPiece(payload: AdminPieceForm): Observable<Piece> {
    return this.http.post<{ piece: Piece }>(`${this.apiUrl}/pieces`, payload).pipe(
      map(({ piece }) => piece),
      tap((piece) => this.adminState.setPieces([...this.adminState.pieces(), piece])),
    );
  }

  updatePiece(id: number, payload: AdminPieceForm): Observable<Piece> {
    return this.http.put<{ piece: Piece }>(`${this.apiUrl}/pieces/${id}`, payload).pipe(
      map(({ piece }) => piece),
      tap((piece) =>
        this.adminState.setPieces(
          this.adminState.pieces().map((existing) => (existing.id === id ? piece : existing)),
        ),
      ),
    );
  }

  deletePiece(id: number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/pieces/${id}`).pipe(
      tap(() =>
        this.adminState.setPieces(this.adminState.pieces().filter((piece) => piece.id !== id)),
      ),
      map(() => undefined),
    );
  }
}
