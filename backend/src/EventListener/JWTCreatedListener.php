<?php

namespace App\EventListener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: 'lexik_jwt_authentication.on_jwt_created')]
class JWTCreatedListener
{
    public function __invoke(JWTCreatedEvent $event): void
    {
        /** @var User $user */
        $user = $event->getUser();

        // Si por alguna razón no es nuestro usuario, salimos
        if (!$user instanceof User) {
            return;
        }

        // Obtenemos los datos actuales del token
        $payload = $event->getData();

        // --- AÑADIMOS LOS DATOS EXTRA ---
        $payload['id'] = $user->getId();
        
        // Asegúrate de que en tu entidad User tienes los métodos getName() y getPhone()
        // Si se llaman diferente (ej: getNombre()), cámbialo aquí.
        $payload['name'] = $user->getName(); 
        $payload['phone'] = $user->getPhone();

        // Guardamos los cambios en el token
        $event->setData($payload);
    }
}