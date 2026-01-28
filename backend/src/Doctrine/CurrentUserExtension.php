<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Message;
use App\Entity\User;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class CurrentUserExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    public function __construct(private readonly Security $security)
    {
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    public function applyToItem(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, array $identifiers, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        // 1. Solo aplicamos esto a la entidad Message
        if (Message::class !== $resourceClass) {
            return;
        }

        // 2. Obtenemos el usuario logueado
        $user = $this->security->getUser();

        // Si no hay usuario, no ve nada
        if (!$user) {
            return;
        }

        // 3. SI ERES ADMIN O VENTAS -> VES TODO
        if ($this->security->isGranted('ROLE_ADMIN') || $this->security->isGranted('ROLE_SALES')) {
            return; 
        }

        // 4. SI ERES UN CLIENTE NORMAL -> Solo ves lo tuyo
        $rootAlias = $queryBuilder->getRootAliases()[0];
        $queryBuilder->andWhere(sprintf('%s.sender = :current_user OR %s.receiver = :current_user', $rootAlias, $rootAlias));
        $queryBuilder->setParameter('current_user', $user);
    }
}