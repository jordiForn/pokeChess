import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

type HttpErrorPayload = {
  error?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
};

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly swalDefaults: SweetAlertOptions = {
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    background: '#2c3e50',
    color: '#f8f9fa',
    confirmButtonColor: '#ffcb05',
    cancelButtonColor: '#4a6278',
  };

  success(title: string, text?: string): Promise<unknown> {
    return Swal.fire({
      ...this.swalDefaults,
      icon: 'success',
      title,
      text,
    });
  }

  error(title: string, text?: string): Promise<unknown> {
    return Swal.fire({
      ...this.swalDefaults,
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#e3350d',
    });
  }

  warning(title: string, text?: string): Promise<unknown> {
    return Swal.fire({
      ...this.swalDefaults,
      icon: 'warning',
      title,
      text,
    });
  }

  info(title: string, text?: string): Promise<unknown> {
    return Swal.fire({
      ...this.swalDefaults,
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#3b5ba7',
    });
  }

  toast(icon: SweetAlertIcon, title: string, options?: SweetAlertOptions): Promise<unknown> {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      background: '#34495e',
      color: '#f8f9fa',
      ...options,
    });
  }

  async confirm(title: string, text?: string): Promise<boolean> {
    const result = await Swal.fire({
      ...this.swalDefaults,
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      reverseButtons: true,
    });

    return result.isConfirmed;
  }

  fromHttpError(error: unknown, fallback = 'Ha ocurrido un error.'): string {
    const payload = error as HttpErrorPayload;
    const validationError = payload?.error?.errors;

    if (validationError) {
      const first = Object.values(validationError)[0]?.[0];
      if (first) {
        return this.translateMessage(first);
      }
    }

    const message = payload?.error?.message;
    if (message) {
      return this.translateMessage(message);
    }

    return fallback;
  }

  showHttpError(error: unknown, fallback = 'Ha ocurrido un error.'): Promise<unknown> {
    return this.error(this.fromHttpError(error, fallback));
  }

  private translateMessage(message: string): string {
    const translations: Record<string, string> = {
      'The email field is required.': 'El correo electrónico es obligatorio.',
      'The password field is required.': 'La contraseña es obligatoria.',
      'The name field is required.': 'El nombre es obligatorio.',
      'The email field must be a valid email address.': 'Introduce un correo electrónico válido.',
      'The password field confirmation does not match.': 'Las contraseñas no coinciden.',
      'The password field must be at least 8 characters.': 'La contraseña debe tener al menos 8 caracteres.',
      'The email has already been taken.': 'Ese correo electrónico ya está registrado.',
      'The selected email is invalid.': 'El correo electrónico no es válido.',
      'The selected role is invalid.': 'El rol seleccionado no es válido.',
      'The selected side is invalid.': 'El bando seleccionado no es válido.',
      'The selected chess type is invalid.': 'El tipo de pieza no es válido.',
      'The selected pokemon type is invalid.': 'El tipo Pokémon no es válido.',
      'The sprite url field is required.': 'No se pudo obtener el sprite del Pokémon.',
      'The sprite url field must be a valid URL.': 'La URL del sprite no es válida.',
      'Server Error': 'Error interno del servidor.',
      'Unauthenticated.': 'Debes iniciar sesión.',
      'Unauthorized.': 'No tienes permisos para esta acción.',
      'passwords.token': 'El enlace de recuperación no es válido o ha expirado.',
      'passwords.user': 'No encontramos ningún usuario con ese email.',
      'passwords.throttled': 'Espera antes de volver a solicitar otro enlace.',
    };

    return translations[message] ?? message;
  }
}
