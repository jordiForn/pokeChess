<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recuperar contraseña · {{ config('app.name') }}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;color:#1b263b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d8e0ea;">
          <tr>
            <td style="background:#1b263b;padding:28px 24px;text-align:center;">
              @if ($logoDataUri)
                <img src="{{ $logoDataUri }}" alt="{{ config('app.name') }}" width="220" style="display:block;margin:0 auto;max-width:220px;height:auto;border:0;">
              @else
                <span style="color:#ffcb05;font-size:24px;font-weight:700;letter-spacing:0.04em;">{{ config('app.name') }}</span>
              @endif
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 12px;font-size:16px;line-height:1.5;">Hola <strong>{{ $user->name }}</strong>,</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4a6278;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en {{ config('app.name') }}.
                Si fuiste tú, pulsa el botón de abajo. El enlace caduca en 60 minutos.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="border-radius:10px;background:#ffcb05;">
                    <a href="{{ $resetUrl }}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#1b263b;text-decoration:none;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4a6278;">
                Si no solicitaste este cambio, ignora este correo. Tu contraseña no se modificará.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#8a99a8;word-break:break-all;">
                Enlace alternativo:<br>
                <a href="{{ $resetUrl }}" style="color:#3b5ba7;text-decoration:underline;">{{ $resetUrl }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e5ebf2;text-align:center;">
              <p style="margin:0;font-size:12px;color:#8a99a8;">
                © {{ date('Y') }} {{ config('app.name') }} · Ajedrez con piezas Pokémon
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
