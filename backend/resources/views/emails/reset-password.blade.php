<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Recuperar contraseña</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #1b263b;">
    <p>Hola {{ $user->name }},</p>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en {{ config('app.name') }}.</p>
    <p>
        <a href="{{ $resetUrl }}" style="display:inline-block;padding:10px 16px;background:#ffcb05;color:#1b263b;text-decoration:none;border-radius:6px;font-weight:bold;">
            Restablecer contraseña
        </a>
    </p>
    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    <p style="font-size:12px;color:#666;">Enlace directo: {{ $resetUrl }}</p>
</body>
</html>
