<?php

namespace App\Repository;

use App\Entity\Vehicle;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Vehicle>
 */
class VehicleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vehicle::class);
    }

    /**
     * Devuelve el total de vehículos y los conteos por status en una sola query (evita múltiples COUNT separados).
     * Retorna: ['total' => int, 'AVAILABLE' => int, 'SOLD' => int, 'RESERVED' => int, ...]
     */
    public function countByStatus(): array
    {
        $rows = $this->createQueryBuilder('v')
            ->select('v.status, COUNT(v.id) AS cnt')
            ->groupBy('v.status')
            ->getQuery()
            ->getResult();

        $counts = ['total' => 0];
        foreach ($rows as $row) {
            $counts[$row['status']] = (int) $row['cnt'];
            $counts['total'] += (int) $row['cnt'];
        }

        return $counts;
    }
}
