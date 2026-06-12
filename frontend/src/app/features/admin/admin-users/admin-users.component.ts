import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AdminStateService } from '../../../core/services/admin-state.service';
import { AlertService } from '../../../core/services/alert.service';
import { UserRole } from '../../../shared/models/user-role';
import { User } from '../../../shared/models/user.model';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';

@Component({
  selector: 'app-admin-users',
  imports: [ReactiveFormsModule, AdminNavComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly adminState = inject(AdminStateService);
  private readonly alert = inject(AlertService);

  protected readonly users = this.adminState.users;
  protected readonly loading = this.adminState.loading;
  protected readonly editingId = signal<number | null>(null);

  protected readonly roles: UserRole[] = ['user', 'admin'];

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    password_confirmation: [''],
    role: ['user' as UserRole, [Validators.required]],
    avatar: [''],
  });

  ngOnInit(): void {
    this.startCreate();
    this.adminService.loadUsers().subscribe({
      error: () => void this.alert.error('No se pudieron cargar los usuarios.'),
    });
  }

  protected startCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'user',
      avatar: '',
    });
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password_confirmation.setValidators([Validators.required]);
    this.form.controls.password.updateValueAndValidity();
    this.form.controls.password_confirmation.updateValueAndValidity();
  }

  protected startEdit(user: User): void {
    this.editingId.set(user.id);
    this.form.patchValue({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.role,
      avatar: user.avatar ?? '',
    });
    this.form.controls.password.clearValidators();
    this.form.controls.password_confirmation.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    this.form.controls.password_confirmation.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      email: raw.email,
      password: raw.password,
      password_confirmation: raw.password_confirmation,
      role: raw.role,
      avatar: raw.avatar.trim() === '' ? null : raw.avatar.trim(),
    };

    const editingId = this.editingId();

    if (editingId === null) {
      this.adminService.createUser(payload).subscribe({
        next: () => {
          void this.alert.success('Usuario creado.');
          this.startCreate();
        },
        error: (error) => void this.alert.showHttpError(error),
      });
      return;
    }

    this.adminService.updateUser(editingId, payload).subscribe({
      next: () => {
        void this.alert.success('Usuario actualizado.');
        this.startCreate();
      },
      error: (error) => void this.alert.showHttpError(error),
    });
  }

  protected async deleteUser(user: User): Promise<void> {
    const confirmed = await this.alert.confirm('Eliminar usuario', `¿Eliminar a ${user.name}?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteUser(user.id).subscribe({
      next: () => void this.alert.success('Usuario eliminado.'),
      error: (error) => void this.alert.showHttpError(error),
    });
  }
}
