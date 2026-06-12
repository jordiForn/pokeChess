<?php

namespace App\Support;

class EmailBrandAssets
{
    public static function logoDataUri(): string
    {
        $path = public_path('images/logo-full.png');

        if (! is_file($path)) {
            return '';
        }

        return 'data:image/png;base64,'.base64_encode((string) file_get_contents($path));
    }
}
