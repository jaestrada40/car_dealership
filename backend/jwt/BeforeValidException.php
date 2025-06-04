<?php
namespace Firebase\JWT;

use Firebase\JWT\JWTExceptionWithPayloadInterface;

class BeforeValidException extends \UnexpectedValueException implements JWTExceptionWithPayloadInterface
{
    private $payload;

    public function __construct($message, $code = 0, \Throwable $previous = null, ?array $payload = null)
    {
        parent::__construct($message, $code, $previous);
        $this->payload = $payload;
    }

    public function getPayload(): ?array
    {
        return $this->payload;
    }
}
