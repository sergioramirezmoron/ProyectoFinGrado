<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Entity\Reservation;
use App\State\ConversationProcessor;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(
    operations: [
        // PUBLICO: Crear
        new Post(
            uriTemplate: '/conversations',
            security: "is_granted('IS_AUTHENTICATED_FULLY')",
            processor: ConversationProcessor::class,
            denormalizationContext: ['groups' => ['conversation:create']]
        ),
        // ADMIN: Ver lista
        new GetCollection(
            security: "is_granted('IS_AUTHENTICATED_FULLY')",
            normalizationContext: ['groups' => ['conversation:read']]
        ),
        // ADMIN: Ver detalle
        new Get(
            security: "is_granted('IS_AUTHENTICATED_FULLY') and (is_granted('ROLE_SALES') or object.getUser() == user or object.getContactEmail() == user.getEmail())",
            normalizationContext: ['groups' => ['conversation:read', 'conversation:detail']]
        ),
        // ADMIN: Editar (Para marcar como LEIDO) - Y ahora también el USUARIO propietario (por ID o por EMAIL)
        new Patch(
            security: "is_granted('IS_AUTHENTICATED_FULLY') and (is_granted('ROLE_SALES') or object.getUser() == user or object.getContactEmail() == user.getEmail())",
            denormalizationContext: ['groups' => ['conversation:status:write']]
        )
    ],
    order: ['updatedAt' => 'DESC']
)]

#[ApiFilter(SearchFilter::class, properties: [
    'status' => 'exact',
    'contactEmail' => 'exact'
])]
class Conversation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['conversation:read'])]
    private ?string $contactName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['conversation:read'])]
    private ?string $contactEmail = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['conversation:read', 'conversation:create'])]
    private ?string $contactPhone = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['conversation:read', 'conversation:create'])]
    private ?Vehicle $vehicle = null;

    #[ORM\OneToMany(mappedBy: 'conversation', targetEntity: Message::class, cascade: ['persist', 'remove'])]
    #[Groups(['conversation:detail', 'conversation:read'])]
    private Collection $messages;

    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 20)]
    #[Groups(['conversation:read', 'conversation:status:write'])]
    #[Assert\Choice(choices: ['NEW', 'READ', 'ARCHIVED', 'NEW_FROM_ADMIN', 'NEW_FROM_CLIENT'], message: "Estado de conversacion no valido")]
    private ?string $status = 'NEW'; // NEW, READ, ARCHIVED

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups(['conversation:read'])]
    private ?User $user = null;

    #[ORM\OneToOne(targetEntity: Reservation::class, cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['conversation:read'])]
    private ?Reservation $reservation = null;

    public function __construct()
    {
        $this->messages = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    // --- GETTERS Y SETTERS BÁSICOS ---

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContactName(): ?string
    {
        return $this->contactName;
    }
    public function setContactName(string $contactName): static
    {
        $this->contactName = $contactName;
        return $this;
    }

    public function getContactEmail(): ?string
    {
        return $this->contactEmail;
    }
    public function setContactEmail(string $contactEmail): static
    {
        $this->contactEmail = $contactEmail;
        return $this;
    }

    public function getContactPhone(): ?string
    {
        return $this->contactPhone;
    }
    public function setContactPhone(?string $contactPhone): static
    {
        $this->contactPhone = $contactPhone;
        return $this;
    }

    public function getVehicle(): ?Vehicle
    {
        return $this->vehicle;
    }
    public function setVehicle(?Vehicle $vehicle): static
    {
        $this->vehicle = $vehicle;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }
    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getReservation(): ?Reservation
    {
        return $this->reservation;
    }

    public function setReservation(?Reservation $reservation): static
    {
        $this->reservation = $reservation;
        return $this;
    }

    public function addMessage(Message $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setConversation($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            if ($message->getConversation() === $this) {
                $message->setConversation(null);
            }
        }

        return $this;
    }
}
