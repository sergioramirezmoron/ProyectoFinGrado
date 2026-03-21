<?php

namespace App\Repository;

use App\Entity\Message;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 */
class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    /**
     * Devuelve los últimos mensajes de clientes junto con su conversación en una sola query (evita N+1).
     */
    public function findRecentClientMessages(int $limit = 5): array
    {
        return $this->createQueryBuilder('m')
            ->select('m', 'c')
            ->innerJoin('m.conversation', 'c')
            ->andWhere('m.isAdmin = :isAdmin')
            ->setParameter('isAdmin', false)
            ->orderBy('m.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}