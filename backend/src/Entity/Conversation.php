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

#[ORM\Entity]
#[ApiResource(
    operations: [
        // PUBLICO: Crear
        new Post(
            uriTemplate: '/conversations',
            security: "is_granted('PUBLIC_ACCESS')",
            denormalizationContext: ['groups' => ['conversation:write']]
        ),
        // ADMIN: Ver lista
        new GetCollection(
            security: "is_granted('ROLE_ADMIN')",
            normalizationContext: ['groups' => ['conversation:read']]
        ),
        // ADMIN: Ver detalle
        new Get(
            security: "is_granted('ROLE_ADMIN')",
            normalizationContext: ['groups' => ['conversation:read', 'conversation:detail']]
        ),
        // ADMIN: Editar (Para marcar como LEIDO) <--- 2. AÑADIR ESTO
        new Patch(
            security: "is_granted('ROLE_ADMIN')",
            denormalizationContext: ['groups' => ['conversation:write']]
        )
    ],
    order: ['updatedAt' => 'DESC']
)]
class Conversation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?string $contactName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?string $contactEmail = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?string $contactPhone = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?Vehicle $vehicle = null;

    #[ORM\OneToMany(mappedBy: 'conversation', targetEntity: Message::class, cascade: ['persist', 'remove'])]
    #[Groups(['conversation:detail', 'conversation:write'])] // Solo cargamos mensajes al entrar al detalle
    private Collection $messages;

    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 20)]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?string $status = 'NEW'; // NEW, READ, ARCHIVED

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups(['conversation:read', 'conversation:write'])]
    private ?User $user = null;

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

    public function addMessage(Message $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            // ESTO ES LO QUE FALTABA: Decirle al mensaje quién es su padre
            $message->setConversation($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getConversation() === $this) {
                $message->setConversation(null);
            }
        }

        return $this;
    }
}
