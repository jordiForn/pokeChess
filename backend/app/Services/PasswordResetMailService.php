<?php

namespace App\Services;

use App\Models\User;
use App\Support\EmailBrandAssets;
use App\Support\PasswordResetUrl;
use Illuminate\Support\Facades\Password;

class PasswordResetMailService
{
    public function __construct(
        private readonly MailtrapApiService $mailtrapApi,
    ) {}

    public function sendResetLink(User $user): void
    {
        $token = Password::createToken($user);
        $resetUrl = PasswordResetUrl::build($user->getEmailForPasswordReset(), $token);

        if ($this->usesMailtrapApi()) {
            $this->mailtrapApi->sendSandboxEmail(
                toEmail: $user->email,
                subject: 'Recuperar contraseña · '.config('app.name'),
                html: view('emails.reset-password', [
                    'user' => $user,
                    'resetUrl' => $resetUrl,
                    'logoDataUri' => EmailBrandAssets::logoDataUri(),
                ])->render(),
                text: $this->buildPlainText($user, $resetUrl),
            );

            return;
        }

        $user->sendPasswordResetNotification($token);
    }

    private function usesMailtrapApi(): bool
    {
        return filled(config('services.mailtrap.api_token'))
            && filled(config('services.mailtrap.inbox_id'));
    }

    private function buildPlainText(User $user, string $resetUrl): string
    {
        return implode("\n\n", [
            "Hola {$user->name},",
            'Recibimos una solicitud para restablecer tu contraseña en '.config('app.name').'.',
            "Restablece tu contraseña aquí: {$resetUrl}",
            'Si no solicitaste este cambio, ignora este correo.',
        ]);
    }
}
