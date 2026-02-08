<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [
        // Enviar mensaje (Puede ser el Admin respondiendo o el Cliente escribiendo más)
        new Post(
            security: "is_granted('PUBLIC_ACCESS')",
            denormalizationContext: ['groups' => ['message:write']]
        )
    ]
)]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['conversation:detail', 'message:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['conversation:detail', 'conversation:write', 'message:write'])]
    // conversation:write permite crear el primer mensaje a la vez que la conversacion
    private ?string $content = null;

    #[ORM\Column]
    #[Groups(['conversation:detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['conversation:detail', 'message:write'])]
    private ?bool $isAdmin = false; // TRUE si responde el dueño de la web, FALSE si es el cliente

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:write'])]
    private ?Conversation $conversation = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
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

        if ($conversation) {
            $conversation->setUpdatedAt(new \DateTimeImmutable());
        }
        return $this;
    }
}
