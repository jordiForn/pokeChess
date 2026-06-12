<?php

namespace App\Providers;

use App\Support\PasswordResetUrl;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        ResetPassword::createUrlUsing(
            fn (object $notifiable, string $token): string => PasswordResetUrl::build(
                $notifiable->getEmailForPasswordReset(),
                $token,
            ),
        );
    }
}
