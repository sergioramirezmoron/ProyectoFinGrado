<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Conversation;
use App\Entity\Favorite;
use App\Entity\Message;
use App\Entity\Reservation;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

final class CurrentUserExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    public function __construct(private readonly Security $security)
    {
    }

    public function applyToCollection(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass, $operation);
    }

    public function applyToItem(QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, array $identifiers, Operation $operation = null, array $context = []): void
    {
        $this->addWhere($queryBuilder, $resourceClass, $operation);
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass, ?Operation $operation): void
    {
        $restrictedResources = [
            Conversation::class,
            Favorite::class,
            Message::class,
            Reservation::class,
        ];

        if (!in_array($resourceClass, $restrictedResources, true)) {
            return;
        }

        if (Reservation::class === $resourceClass && $operation?->getUriTemplate() === '/reservations/availability') {
            return;
        }

        if ($this->security->isGranted('ROLE_SALES')) {
            return;
        }

        $user = $this->security->getUser();
        $rootAlias = $queryBuilder->getRootAliases()[0];

        if (!$user) {
            $queryBuilder->andWhere('1 = 0');
            return;
        }

        if (Conversation::class === $resourceClass) {
            $queryBuilder
                ->andWhere(sprintf('%s.user = :current_user OR %s.contactEmail = :current_email', $rootAlias, $rootAlias))
                ->setParameter('current_user', $user)
                ->setParameter('current_email', $user->getUserIdentifier());
            return;
        }

        if (Message::class === $resourceClass) {
            $queryBuilder
                ->innerJoin(sprintf('%s.conversation', $rootAlias), 'msg_conv')
                ->andWhere('msg_conv.user = :current_user OR msg_conv.contactEmail = :current_email')
                ->setParameter('current_user', $user)
                ->setParameter('current_email', $user->getUserIdentifier());
            return;
        }

        $queryBuilder
            ->andWhere(sprintf('%s.user = :current_user', $rootAlias))
            ->setParameter('current_user', $user);
    }
}
