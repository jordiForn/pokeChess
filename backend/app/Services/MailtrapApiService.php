<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class MailtrapApiService
{
    public function sendSandboxEmail(
        string $toEmail,
        string $subject,
        string $html,
        ?string $text = null,
    ): void {
        $token = (string) config('services.mailtrap.api_token');
        $inboxId = (string) config('services.mailtrap.inbox_id');

        if ($token === '' || $inboxId === '') {
            throw new RuntimeException('Mailtrap API no configurada.');
        }

        $payload = [
            'from' => [
                'email' => (string) config('mail.from.address'),
                'name' => (string) config('mail.from.name'),
            ],
            'to' => [
                ['email' => $toEmail],
            ],
            'subject' => $subject,
            'html' => $html,
        ];

        if ($text !== null) {
            $payload['text'] = $text;
        }

        $response = Http::timeout(20)
            ->withToken($token)
            ->acceptJson()
            ->post("https://sandbox.api.mailtrap.io/api/send/{$inboxId}", $payload);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Mailtrap API error: '.$response->status().' '.$response->body(),
            );
        }
    }
}
