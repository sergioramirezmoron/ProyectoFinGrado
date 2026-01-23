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

        // Si faltan datos, no validamos (ya saltarán otros errores)
        if (!$value->getVehicle() || !$value->getStartDate() || !$value->getEndDate()) {
            return;
        }

        // Buscamos reservas que coincidan ("SOLAPAMIENTO")
        // Lógica: Una reserva nueva choca si empieza antes de que termine la otra Y termina después de que empiece la otra.
        $conflicts = $this->reservationRepo->findOverlappingReservations(
            $value->getVehicle(),
            $value->getStartDate(),
            $value->getEndDate()
        );

        if (count($conflicts) > 0) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ start }}', $conflicts[0]->getStartDate()->format('Y-m-d'))
                ->setParameter('{{ end }}', $conflicts[0]->getEndDate()->format('Y-m-d'))
                ->addViolation();
        }
    }
}