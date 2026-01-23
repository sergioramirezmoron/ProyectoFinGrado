<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\BodyTypeRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: BodyTypeRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['bodyType:read']],
    denormalizationContext: ['groups' => ['bodyType:write']]
)]
class BodyType
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['bodyType:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['bodyType:read', 'bodyType:write', 'vehicle:read'])]
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
