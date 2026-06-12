import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, firstValueFrom, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, ForgotPasswordRequest, LoginRequest, MessageResponse, RegisterRequest, ResetPasswordRequest } from '../../shared/models/auth.model';
import { User } from '../../shared/models/user.model';
import { AuthStateService } from './auth-state.service';

const TOKEN_KEY = 'pokechess_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);

  private readonly apiUrl = `${environment.apiUrl}/v1`;

  initialize(): Promise<void> {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return Promise.resolve();
    }

    this.authState.setSession(token, {
      id: 0,
      name: '',
      email: '',
      role: 'user',
      avatar: null,
    });

    return firstValueFrom(
      this.http.get<{ user: User }>(`${this.apiUrl}/user`).pipe(
        tap(({ user }) => this.persistSession(token, user)),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
      ),
    ).then(() => undefined);
  }

  login(payload: LoginRequest): Observable<User> {
    this.authState.setLoading(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(({ user, token }) => this.persistSession(token, user)),
      map(({ user }) => user),
      finalize(() => this.authState.setLoading(false)),
    );
  }

  register(payload: RegisterRequest): Observable<User> {
    this.authState.setLoading(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(({ user, token }) => this.persistSession(token, user)),
      map(({ user }) => user),
      finalize(() => this.authState.setLoading(false)),
    );
  }

  logout(): Observable<void> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      map(() => undefined),
      catchError(() => {
        this.clearSession();
        return of(undefined);
      }),
    );
  }

  requestPasswordReset(payload: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, payload);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.authState.clearSession();
  }

  private persistSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.authState.setSession(token, user);
  }
}
