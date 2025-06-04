<?php
namespace Firebase\JWT;

interface JWTExceptionWithPayloadInterface
{
    public function getPayload(): ?array;
}
