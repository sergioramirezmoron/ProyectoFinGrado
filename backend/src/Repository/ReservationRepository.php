<?php

namespace App\Repository;

use App\Entity\Reservation;
use App\Entity\Vehicle;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reservation>
 */
class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    public function findOverlappingReservations($vehicle, \DateTimeInterface $start, \DateTimeInterface $end): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.vehicle = :vehicle')
            ->andWhere('r.startDate <= :end')
            ->andWhere('r.endDate >= :start')
            ->andWhere('r.status NOT IN (:ignoredStatuses)')
            ->setParameter('ignoredStatuses', ['REJECTED', 'PENDING', 'CANCELLED'])
            ->setParameter('vehicle', $vehicle)
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getResult();
    }
}
