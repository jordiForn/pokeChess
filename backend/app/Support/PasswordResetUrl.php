<?php

namespace App\Support;

class PasswordResetUrl
{
    public static function build(string $email, string $token): string
    {
        return rtrim((string) config('app.frontend_url'), '/')
            .'/reset-password?token='.urlencode($token)
            .'&email='.urlencode($email);
    }
}
