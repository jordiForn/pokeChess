import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';

import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alert = inject(AlertService);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email') ?? '';
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.form.patchValue({ email, token });

    if (!email || !token) {
      void this.alert.warning(
        'Enlace incompleto',
        'Usa el enlace completo del correo de recuperación.',
      );
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.resetPassword(this.form.getRawValue()).subscribe({
      next: ({ message }) => {
        void this.alert.success('Contraseña actualizada', message);
        void this.router.navigate(['/login']);
      },
      error: (error) =>
        void this.alert.error(
          'No se pudo restablecer la contraseña',
          this.alert.fromHttpError(error, 'El enlace puede haber expirado.'),
        ),
    });
  }
}
