<?php
namespace Firebase\JWT;

class JWT
{
    public static function encode($payload, $key, $alg = 'HS256', $keyId = null, $head = null)
    {
        $header = ['typ' => 'JWT', 'alg' => $alg];
        if ($head) {
            $header = array_merge($head, $header);
        }
        $segments = [];
        $segments[] = static::urlsafeB64Encode(static::jsonEncode($header));
        $segments[] = static::urlsafeB64Encode(static::jsonEncode($payload));
        $signing_input = implode('.', $segments);
        $signature = static::sign($signing_input, $key, $alg);
        $segments[] = static::urlsafeB64Encode($signature);
        return implode('.', $segments);
    }

    public static function decode($jwt, $key, array $allowed_algs = array())
    {
        $tks = explode('.', $jwt);
        if (count($tks) != 3) {
            throw new \UnexpectedValueException('Wrong number of segments');
        }
        list($headb64, $bodyb64, $cryptob64) = $tks;
        if (null === ($header = static::jsonDecode(static::urlsafeB64Decode($headb64)))) {
            throw new \UnexpectedValueException('Invalid header encoding');
        }
        if (null === $payload = static::jsonDecode(static::urlsafeB64Decode($bodyb64))) {
            throw new \UnexpectedValueException('Invalid claims encoding');
        }
        if (false === ($sig = static::urlsafeB64Decode($cryptob64))) {
            throw new \UnexpectedValueException('Invalid signature encoding');
        }
        if (empty($header->alg)) {
            throw new \DomainException('Empty algorithm');
        }
        if (!in_array($header->alg, $allowed_algs)) {
            throw new \DomainException('Algorithm not allowed');
        }
        if (!static::verify("$headb64.$bodyb64", $sig, $key, $header->alg)) {
            throw new SignatureInvalidException('Signature verification failed');
        }
        return (array) $payload;
    }

    private static function sign($msg, $key, $alg)
    {
        switch ($alg) {
            case 'HS256':
                return hash_hmac('sha256', $msg, $key, true);
            default:
                throw new \DomainException('Algorithm not supported');
        }
    }

    private static function verify($msg, $signature, $key, $alg)
    {
        switch ($alg) {
            case 'HS256':
                $hash = hash_hmac('sha256', $msg, $key, true);
                return hash_equals($signature, $hash);
            default:
                throw new \DomainException('Algorithm not supported');
        }
    }

    private static function jsonDecode($input)
    {
        $obj = json_decode($input);
        if (function_exists('json_last_error') && $errno = json_last_error()) {
            throw new \DomainException('JSON decode error: ' . $errno);
        } elseif ($obj === null && $input !== 'null') {
            throw new \DomainException('Null result with non-null input');
        }
        return $obj;
    }

    private static function jsonEncode($input)
    {
        $json = json_encode($input);
        if (function_exists('json_last_error') && $errno = json_last_error()) {
            throw new \DomainException('JSON encode error: ' . $errno);
        } elseif ($json === 'null' && $input !== null) {
            throw new \DomainException('Null result with non-null input');
        }
        return $json;
    }

    private static function urlsafeB64Decode($input)
    {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $input .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($input, '-_', '+/'));
    }

    private static function urlsafeB64Encode($input)
    {
        return str_replace('=', '', strtr(base64_encode($input), '+/', '-_'));
    }
}
