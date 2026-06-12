import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/services/auth-state.service';

import { AppLogoComponent } from '../logo/app-logo.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, IconComponent, AppLogoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);

  protected readonly user = this.authState.user;
  protected readonly isAdmin = this.authState.isAdmin;

  protected readonly initials = computed(() => {
    const name = this.user()?.name?.trim() ?? '';
    if (!name) {
      return '?';
    }

    return name
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  protected logout(): void {
    this.authService.logout().subscribe(() => {
      window.location.href = '/login';
    });
  }
}
