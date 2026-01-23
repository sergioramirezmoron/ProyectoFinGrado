<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\FuelRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: FuelRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['fuel:read']],
    denormalizationContext: ['groups' => ['fuel:write']]
)]
class Fuel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['fuel:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['fuel:read', 'fuel:write', 'vehicle:read'])]
    private ?string $name = null;

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
    public function __toString(): string
    {
        return $this->name ?? '';
    }
}
