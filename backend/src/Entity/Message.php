<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        // Enviar mensaje (Puede ser el Admin respondiendo o el Cliente escribiendo más)
        new Post(
            security: "is_granted('IS_AUTHENTICATED_FULLY')",
            denormalizationContext: ['groups' => ['message:write']]
        )
    ]
)]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['conversation:detail', 'message:read', 'conversation:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    // ✅ AÑADIDO 'conversation:read' para que se vea el texto en la lista
    #[Groups(['conversation:detail', 'conversation:write', 'message:write', 'conversation:read'])]
    private ?string $content = null;

    #[ORM\Column]
    // ✅ AÑADIDO 'conversation:read' para ordenar por fecha
    #[Groups(['conversation:detail', 'conversation:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    // ✅ AÑADIDO 'conversation:read' para el PUNTO ROJO (saber quién escribió)
    #[Groups(['conversation:detail', 'message:write', 'conversation:read'])]
    private ?bool $isAdmin = false;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    // ❌ AQUÍ NO PONEMOS 'conversation:read' (Evita el error 500 de bucle)
    #[Groups(['message:write'])]
    private ?Conversation $conversation = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PrePersist]
    public function updateConversationStatus(): void
    {
        if ($this->conversation) {
            $this->conversation->setUpdatedAt(new \DateTimeImmutable());
            // Si el mensaje es de Admin, estado es "Nuevo para Cliente"
            // Si es de Cliente, estado es "Nuevo para Admin"
            $newStatus = $this->isAdmin ? 'NEW_FROM_ADMIN' : 'NEW_FROM_CLIENT';
            $this->conversation->setStatus($newStatus);
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }
    public function setContent(string $content): static
    {
        $this->content = $content;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function isIsAdmin(): ?bool
    {
        return $this->isAdmin;
    }
    public function setIsAdmin(bool $isAdmin): static
    {
        $this->isAdmin = $isAdmin;
        return $this;
    }

    public function getConversation(): ?Conversation
    {
        return $this->conversation;
    }
    public function setConversation(?Conversation $conversation): static
    {
        $this->conversation = $conversation;
        return $this;
    }
}