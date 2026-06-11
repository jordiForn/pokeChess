import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateProfileRequest } from '../../shared/models/profile.model';
import { User } from '../../shared/models/user.model';
import { AuthStateService } from './auth-state.service';
import { UserStateService } from './user-state.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);
  private readonly userState = inject(UserStateService);

  private readonly apiUrl = `${environment.apiUrl}/v1`;

  loadProfile(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/profile`).pipe(
      map(({ user }) => user),
      tap((user) => this.syncUser(user)),
    );
  }

  updateProfile(payload: UpdateProfileRequest): Observable<User> {
    return this.http.put<{ user: User }>(`${this.apiUrl}/profile`, payload).pipe(
      map(({ user }) => user),
      tap((user) => this.syncUser(user)),
    );
  }

  private syncUser(user: User): void {
    const token = this.authState.token();

    if (token) {
      this.authState.setSession(token, user);
    }

    this.userState.setProfile(user);
  }
}
