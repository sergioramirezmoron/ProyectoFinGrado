<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Conversation;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

final class ConversationProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Conversation) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Debes iniciar sesion para crear conversaciones.');
        }

        if ($operation instanceof Post) {
            $fullName = trim(sprintf('%s %s', $user->getName() ?? '', $user->getSurname() ?? ''));

            $data->setUser($user);
            $data->setContactName($fullName !== '' ? $fullName : $user->getEmail());
            $data->setContactEmail($user->getEmail());

            if (!$data->getContactPhone()) {
                $data->setContactPhone($user->getPhone());
            }

            $data->setReservation(null);
            $data->setStatus('NEW');
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
