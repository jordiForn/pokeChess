import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStateService } from '../../core/services/auth-state.service';
import { StatsService } from '../../core/services/stats.service';
import { UserService } from '../../core/services/user.service';
import { UserStateService } from '../../core/services/user-state.service';
import { StatsSummaryComponent } from '../../shared/components/stats-summary/stats-summary.component';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, StatsSummaryComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly userService = inject(UserService);
  private readonly statsService = inject(StatsService);
  private readonly authState = inject(AuthStateService);
  private readonly userState = inject(UserStateService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly user = this.authState.user;
  protected readonly stats = this.userState.stats;

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: [{ value: '', disabled: true }],
    avatar: [''],
  });

  ngOnInit(): void {
    this.statsService.loadStats().subscribe();

    this.userService.loadProfile().subscribe({
      next: (user) => this.patchForm(user),
      error: () => {
        const user = this.user();
        if (user) {
          this.patchForm(user);
        } else {
          this.loading.set(false);
        }
        this.errorMessage.set('No se pudo cargar el perfil.');
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const { name, avatar } = this.form.getRawValue();

    this.userService
      .updateProfile({
        name,
        avatar: avatar.trim() === '' ? null : avatar.trim(),
      })
      .subscribe({
        next: (user) => {
          this.patchForm(user);
          this.successMessage.set('Perfil actualizado.');
          this.saving.set(false);
        },
        error: (error: { error?: { message?: string; errors?: Record<string, string[]> } }) => {
          const validationError = error?.error?.errors;
          const firstError = validationError
            ? Object.values(validationError)[0]?.[0]
            : null;
          this.errorMessage.set(firstError ?? error?.error?.message ?? 'No se pudo guardar el perfil.');
          this.saving.set(false);
        },
      });
  }

  private patchForm(user: { name: string; email: string; avatar: string | null }): void {
    this.form.patchValue({
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? '',
    });
    this.loading.set(false);
  }
}
