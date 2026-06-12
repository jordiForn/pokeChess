<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Password;

class PasswordResetMailService
{
    public function __construct(
        private readonly MailtrapApiService $mailtrapApi,
    ) {}

    public function sendResetLink(User $user): void
    {
        $token = Password::createToken($user);
        $resetUrl = $this->buildResetUrl($user, $token);

        if ($this->usesMailtrapApi()) {
            $this->mailtrapApi->sendSandboxEmail(
                toEmail: $user->email,
                subject: 'Recuperar contraseña - '.config('app.name'),
                html: view('emails.reset-password', [
                    'user' => $user,
                    'resetUrl' => $resetUrl,
                ])->render(),
                text: "Hola {$user->name}, restablece tu contraseña aquí: {$resetUrl}",
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

    private function buildResetUrl(User $user, string $token): string
    {
        return rtrim((string) config('app.frontend_url'), '/')
            .'/reset-password?token='.urlencode($token)
            .'&email='.urlencode($user->getEmailForPasswordReset());
    }
}
