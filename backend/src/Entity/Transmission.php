<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\TransmissionRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TransmissionRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['transmission:read']],
    denormalizationContext: ['groups' => ['transmission:write']]
)]
class Transmission
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['transmission:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['transmission:read', 'transmission:write', 'vehicle:read'])]
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
