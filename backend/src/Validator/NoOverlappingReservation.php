<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute]
class NoOverlappingReservation extends Constraint
{
    public string $message = 'El vehículo ya está reservado en estas fechas (del {{ start }} al {{ end }}).';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}