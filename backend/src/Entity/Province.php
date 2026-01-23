<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ProvinceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ProvinceRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['province:read']],
    denormalizationContext: ['groups' => ['province:write']]
)]
class Province
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['province:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['province:read', 'province:write', 'vehicle:read', 'user:read'])]
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
}
