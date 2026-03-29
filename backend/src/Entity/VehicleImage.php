<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Controller\CreateVehicleImageAction;
use App\Repository\VehicleImageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\SerializedName; // Importante para mapear main

#[ORM\Entity(repositoryClass: VehicleImageRepository::class)]
#[ApiResource(
    operations: [
        new Get(),
        new Post(
            controller: CreateVehicleImageAction::class,
            deserialize: false,
            inputFormats: ['multipart' => ['multipart/form-data']],
        ),
        new Delete(),
        new Patch(),
    ],
    normalizationContext: ['groups' => ['vehicleImage:read']],
    denormalizationContext: ['groups' => ['vehicleImage:write']]
)]
class VehicleImage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['vehicleImage:read', 'vehicle:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['vehicleImage:read', 'vehicleImage:write', 'vehicle:read', 'conversation:read', 'reservation:read'])]
    private ?string $filename = null;

    #[ORM\Column]
    private ?bool $isMain = null;

    #[ORM\ManyToOne(inversedBy: 'vehicleImages')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['vehicleImage:read', 'vehicleImage:write'])]
    private ?Vehicle $vehicle = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFilename(): ?string
    {
        return $this->filename;
    }

    public function setFilename(string $filename): static
    {
        $this->filename = $filename;
        return $this;
    }

    #[Groups(['vehicleImage:read', 'vehicle:read', 'conversation:read', 'reservation:read'])]
    #[SerializedName("main")]
    public function isMain(): ?bool
    {
        return $this->isMain;
    }

    #[Groups(['vehicleImage:write'])]
    public function setIsMain(bool $isMain): static
    {
        $this->isMain = $isMain;
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

    #[Groups(['vehicleImage:read', 'vehicle:read', 'conversation:read', 'reservation:read'])]
    public function getImageUrl(): string
    {
        if (str_starts_with($this->filename, 'http://') || str_starts_with($this->filename, 'https://')) {
            return $this->filename;
        }
        return '/images/vehicles/' . $this->filename;
    }
}