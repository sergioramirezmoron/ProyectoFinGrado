<?php

namespace App\Validator;

use App\Entity\Reservation;
use App\Repository\ReservationRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class NoOverlappingReservationValidator extends ConstraintValidator
{
    public function __construct(private ReservationRepository $reservationRepo) {}

    public function validate($value, Constraint $constraint): void
    {
        if (!$constraint instanceof NoOverlappingReservation) {
            throw new UnexpectedTypeException($constraint, NoOverlappingReservation::class);
        }

        if (!$value instanceof Reservation) {
            return;
        }

        // 1. NUEVO: Si la reserva se está cancelando o rechazando, 
        // no importa si se solapa con otras. Permitimos guardar.
        if (in_array($value->getStatus(), ['REJECTED', 'CANCELLED'])) {
            return;
        }

        // Si faltan datos (fechas o vehículo), no validamos
        if (!$value->getVehicle() || !$value->getStartDate() || !$value->getEndDate()) {
            return;
        }

        // Buscamos reservas que coincidan en fechas
        $conflicts = $this->reservationRepo->findOverlappingReservations(
            $value->getVehicle(),
            $value->getStartDate(),
            $value->getEndDate()
        );

        // Filtramos los resultados para ignorar la propia reserva
        // (por si estamos editando una existente y choca consigo misma)
        foreach ($conflicts as $conflict) {
            // Si el ID es el mismo, es la misma reserva -> Ignorar
            if ($conflict->getId() !== null && $conflict->getId() === $value->getId()) {
                continue;
            }

            // Si llegamos aquí, hemos encontrado UN CONFLICTO REAL con OTRA reserva
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ start }}', $conflict->getStartDate()->format('d/m/Y'))
                ->setParameter('{{ end }}', $conflict->getEndDate()->format('d/m/Y'))
                ->addViolation();
            
            // Con encontrar una, salimos.
            return;
        }
    }
}