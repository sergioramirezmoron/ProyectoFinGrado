<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\EnviromentalBadgeRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: EnviromentalBadgeRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['enviromentalBadge:read']],
    denormalizationContext: ['groups' => ['enviromentalBadge:write']]
)]
class EnviromentalBadge
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['enviromentalBadge:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['enviromentalBadge:read', 'enviromentalBadge:write', 'vehicle:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['enviromentalBadge:read', 'enviromentalBadge:write', 'vehicle:read'])]
    private ?string $image = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;

        return $this;
    }
    #[Groups(['enviromentalBadge:read', 'vehicle:read'])]
    public function getImageUrl(): string
    {
        return '/images/enviromentalBadges/' . $this->image;
    }
}
