<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\VehicleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
// Importamos Entidades Relacionadas
use App\Entity\Fuel;
use App\Entity\Transmission;
use App\Entity\BodyType;
use App\Entity\EnviromentalBadge;
use App\Entity\Color;
use App\Entity\Province;
use App\Entity\VehicleImage;
// Importamos Filtros
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\RangeFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: VehicleRepository::class)]
// 1. FILTROS DE BÚSQUEDA
#[ApiFilter(SearchFilter::class, properties: [
    'brand.name' => 'partial',
    'model.name' => 'partial',
    'province.name' => 'exact',
    'fuelType.name' => 'exact',
    'transmission.name' => 'exact',
    'status' => 'exact',
    'type' => 'exact'
])]
// 2. FILTROS DE RANGO (Precio, Año, Km)
#[ApiFilter(RangeFilter::class, properties: ['price', 'dailyPrice', 'kilometres', 'year', 'power'])]
// 3. ORDENACIÓN DINÁMICA
#[ApiFilter(OrderFilter::class, properties: ['price', 'dailyPrice', 'year', 'kilometres', 'createdAt'], arguments: ['orderParameterName' => 'order'])]

// --- CONFIGURACIÓN PRINCIPAL DE LA API ---
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_SALES')"),
        new Put(security: "is_granted('ROLE_SALES')"),
        new Patch(security: "is_granted('ROLE_SALES')"),
        new Delete(security: "is_granted('ROLE_ADMIN')")
    ],
    // Grupos de Serialización
    normalizationContext: ['groups' => ['vehicle:read']],
    denormalizationContext: ['groups' => ['vehicle:write']],
    
    // AJUSTES MAESTROS (Paginación y Orden)
    paginationItemsPerPage: 20,
    order: ['createdAt' => 'DESC']
)]
class Vehicle
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['vehicle:read', 'favorite:read', 'reservation:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Brand::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\NotNull(message: "La marca es obligatoria")]
    private ?Brand $brand = null;

    #[ORM\ManyToOne(targetEntity: Model::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\NotNull(message: "El modelo es obligatorio")]
    private ?Model $model = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\PositiveOrZero(message: "El precio no puede ser negativo")]
    private ?float $price = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\GreaterThan(1900, message: "El año debe ser válido (mayor a 1900)")]
    private ?int $year = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\PositiveOrZero(message: "Los kilómetros no pueden ser negativos")]
    private ?int $kilometres = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\Positive(message: "La potencia debe ser positiva")]
    private ?int $power = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\Positive(message: "La cilindrada debe ser positiva")]
    private ?int $displacement = null;

    #[ORM\ManyToOne(targetEntity: Fuel::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?Fuel $fuelType = null;

    #[ORM\ManyToOne(targetEntity: Transmission::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?Transmission $transmission = null;

    #[ORM\ManyToOne(targetEntity: BodyType::class)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?BodyType $bodyType = null;

    #[ORM\ManyToOne(targetEntity: EnviromentalBadge::class)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?EnviromentalBadge $enviromentalBadge = null;

    #[ORM\ManyToOne(targetEntity: Color::class)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?Color $color = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\Range(min: 2, max: 10, notInRangeMessage: "El número de puertas debe estar entre 2 y 10")]
    private ?int $doors = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\PositiveOrZero(message: "El número de dueños no puede ser negativo")]
    private ?int $owners = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $description = null;

    #[ORM\Column(length: 255)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $status = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?\DateTime $updatedAt = null;

    /**
     * @var Collection<int, VehicleImage>
     */
    #[ORM\OneToMany(targetEntity: VehicleImage::class, mappedBy: 'vehicle', orphanRemoval: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private Collection $vehicleImages;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?bool $visible = null;

    #[ORM\ManyToOne]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?Province $province = null;

    #[ORM\Column(length: 10)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\Choice(choices: ['SALE', 'RENT'], message: "El tipo debe ser SALE o RENT")]
    private ?string $type = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 6, scale: 2, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    #[Assert\PositiveOrZero(message: "El precio diario no puede ser negativo")]
    private ?string $dailyPrice = null;

    public function __construct()
    {
        $this->vehicleImages = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->status = 'AVAILABLE';
        $this->visible = true;
    }

    // =========================================================================
    // GETTERS Y SETTERS (COMPLETOS)
    // =========================================================================

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBrand(): ?Brand
    {
        return $this->brand;
    }

    public function setBrand(?Brand $brand): static
    {
        $this->brand = $brand;
        return $this;
    }

    public function getModel(): ?Model
    {
        return $this->model;
    }

    public function setModel(?Model $model): static
    {
        $this->model = $model;
        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(?float $price): static
    {
        $this->price = $price;
        return $this;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(int $year): static
    {
        $this->year = $year;
        return $this;
    }

    public function getKilometres(): ?int
    {
        return $this->kilometres;
    }

    public function setKilometres(int $kilometres): static
    {
        $this->kilometres = $kilometres;
        return $this;
    }

    public function getPower(): ?int
    {
        return $this->power;
    }

    public function setPower(int $power): static
    {
        $this->power = $power;
        return $this;
    }

    public function getDisplacement(): ?int
    {
        return $this->displacement;
    }

    public function setDisplacement(?int $displacement): static
    {
        $this->displacement = $displacement;
        return $this;
    }

    public function getFuelType(): ?Fuel
    {
        return $this->fuelType;
    }

    public function setFuelType(?Fuel $fuelType): static
    {
        $this->fuelType = $fuelType;
        return $this;
    }

    public function getTransmission(): ?Transmission
    {
        return $this->transmission;
    }

    public function setTransmission(?Transmission $transmission): static
    {
        $this->transmission = $transmission;
        return $this;
    }

    public function getBodyType(): ?BodyType
    {
        return $this->bodyType;
    }

    public function setBodyType(?BodyType $bodyType): static
    {
        $this->bodyType = $bodyType;
        return $this;
    }

    public function getEnviromentalBadge(): ?EnviromentalBadge
    {
        return $this->enviromentalBadge;
    }

    public function setEnviromentalBadge(?EnviromentalBadge $enviromentalBadge): static
    {
        $this->enviromentalBadge = $enviromentalBadge;
        return $this;
    }

    public function getColor(): ?Color
    {
        return $this->color;
    }

    public function setColor(?Color $color): static
    {
        $this->color = $color;
        return $this;
    }

    public function getDoors(): ?int
    {
        return $this->doors;
    }

    public function setDoors(int $doors): static
    {
        $this->doors = $doors;
        return $this;
    }

    public function getOwners(): ?int
    {
        return $this->owners;
    }

    public function setOwners(int $owners): static
    {
        $this->owners = $owners;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
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

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return Collection<int, VehicleImage>
     */
    public function getVehicleImages(): Collection
    {
        return $this->vehicleImages;
    }

    public function addVehicleImage(VehicleImage $vehicleImage): static
    {
        if (!$this->vehicleImages->contains($vehicleImage)) {
            $this->vehicleImages->add($vehicleImage);
            $vehicleImage->setVehicle($this);
        }

        return $this;
    }

    public function removeVehicleImage(VehicleImage $vehicleImage): static
    {
        if ($this->vehicleImages->removeElement($vehicleImage)) {
            // set the owning side to null (unless already changed)
            if ($vehicleImage->getVehicle() === $this) {
                $vehicleImage->setVehicle(null);
            }
        }

        return $this;
    }

    public function isVisible(): ?bool
    {
        return $this->visible;
    }

    public function setVisible(bool $visible): static
    {
        $this->visible = $visible;
        return $this;
    }

    public function getProvince(): ?Province
    {
        return $this->province;
    }

    public function setProvince(?Province $province): static
    {
        $this->province = $province;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getDailyPrice(): ?string
    {
        return $this->dailyPrice;
    }

    public function setDailyPrice(?string $dailyPrice): static
    {
        $this->dailyPrice = $dailyPrice;
        return $this;
    }
}