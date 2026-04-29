<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Message;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

final class MessageProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Message) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Debes iniciar sesion para enviar mensajes.');
        }

        $conversation = $data->getConversation();
        if (!$conversation) {
            throw new BadRequestHttpException('El mensaje debe pertenecer a una conversacion.');
        }

        $isStaff = $this->security->isGranted('ROLE_SALES');
        $isOwner = $conversation->getUser() === $user || $conversation->getContactEmail() === $user->getEmail();
        if (!$isStaff && !$isOwner) {
            throw new AccessDeniedException('No puedes enviar mensajes en esta conversacion.');
        }

        $data->setIsAdmin($isStaff);

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
