<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ColorRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;

#[ORM\Entity(repositoryClass: ColorRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('PUBLIC_ACCESS')"),
        new Get(security: "is_granted('PUBLIC_ACCESS')"),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')")
    ],
    normalizationContext: ['groups' => ['color:read']],
    denormalizationContext: ['groups' => ['color:write']]
)]
class Color
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['color:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['color:read', 'color:write', 'vehicle:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['color:read', 'color:write'])]
    private ?string $hexCode = null;

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

    public function getHexCode(): ?string
    {
        return $this->hexCode;
    }

    public function setHexCode(?string $hexCode): static
    {
        $this->hexCode = $hexCode;

        return $this;
    }
}
