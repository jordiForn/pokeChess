<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.mailtrap.api_token' => 'test-mailtrap-token',
            'services.mailtrap.inbox_id' => '123456',
            'app.frontend_url' => 'http://localhost:4200',
        ]);
    }

    public function test_user_can_request_password_reset_link(): void
    {
        Http::fake([
            'sandbox.api.mailtrap.io/*' => Http::response(['success' => true], 200),
        ]);

        $user = User::factory()->create([
            'email' => 'reset@example.com',
        ]);

        $response = $this->postJson('/api/v1/forgot-password', [
            'email' => 'reset@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Si el email existe, recibirás un enlace de recuperación en breve.');

        Http::assertSent(function ($request) use ($user) {
            return $request->url() === 'https://sandbox.api.mailtrap.io/api/send/123456'
                && $request['to'][0]['email'] === $user->email;
        });
    }

    public function test_forgot_password_returns_generic_message_for_unknown_email(): void
    {
        Http::fake();

        $response = $this->postJson('/api/v1/forgot-password', [
            'email' => 'missing@example.com',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Si el email existe, recibirás un enlace de recuperación en breve.');

        Http::assertNothingSent();
    }

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => 'old-password',
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/reset-password', [
            'email' => 'reset@example.com',
            'token' => $token,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.');

        $user->refresh();

        $this->assertTrue(Hash::check('new-password-123', $user->password));
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        User::factory()->create([
            'email' => 'reset@example.com',
        ]);

        $response = $this->postJson('/api/v1/reset-password', [
            'email' => 'reset@example.com',
            'token' => 'invalid-token',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
