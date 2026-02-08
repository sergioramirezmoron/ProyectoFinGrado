<?php

namespace App\EventListener;

use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Events;
use Doctrine\ORM\EntityManagerInterface;

#[AsEntityListener(event: Events::postPersist, method: 'postPersist', entity: Reservation::class)]
class ReservationCreatedListener
{
    public function __construct(private EntityManagerInterface $entityManager)
    {}

    public function postPersist(Reservation $reservation, PostPersistEventArgs $event): void
    {
        if (!$reservation->getUser()) {
            return;
        }

        // Crear la conversación
        $conversation = new Conversation();
        $conversation->setVehicle($reservation->getVehicle());
        $conversation->setContactName($reservation->getUser()->getName() . ' ' . $reservation->getUser()->getSurname());
        $conversation->setContactEmail($reservation->getUser()->getEmail());
        $conversation->setContactPhone($reservation->getUser()->getPhone() ?? 'Sin teléfono');
        $conversation->setStatus('NEW');
        $conversation->setReservation($reservation);
        
        $msgContent = sprintf(
            "🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: %s al %s\n💰 Total: %s€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.",
            $reservation->getStartDate()->format('d/m/Y'),
            $reservation->getEndDate()->format('d/m/Y'),
            $reservation->getTotalPrice()
        );

        $message = new Message();
        $message->setContent($msgContent);
        $message->setIsAdmin(false);
        $message->setConversation($conversation);

        $this->entityManager->persist($conversation);
        $this->entityManager->persist($message);
        $this->entityManager->flush();
    }
}