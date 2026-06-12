<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Services\PasswordResetMailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends ApiController
{
    public function __construct(
        private readonly PasswordResetMailService $passwordResetMail,
    ) {}

    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->string('email')->toString();
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            return response()->json([
                'message' => 'Si el email existe, recibirás un enlace de recuperación en breve.',
            ]);
        }

        try {
            $this->passwordResetMail->sendResetLink($user);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'No se pudo enviar el correo. Verifica MAILTRAP_API_TOKEN y MAILTRAP_INBOX_ID en Railway.',
            ], 503);
        }

        return response()->json([
            'message' => 'Si el email existe, recibirás un enlace de recuperación en breve.',
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                $user->tokens()->delete();
            },
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
