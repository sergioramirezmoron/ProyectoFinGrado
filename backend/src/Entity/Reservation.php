<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Validator\NoOverlappingReservation;
use App\State\ReservationProcessor;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('IS_AUTHENTICATED_FULLY')"),
        new GetCollection(
            uriTemplate: '/reservations/availability',
            security: "is_granted('PUBLIC_ACCESS')",
            normalizationContext: ['groups' => ['reservation:availability:read']]
        ),
        new Get(security: "is_granted('IS_AUTHENTICATED_FULLY') and (is_granted('ROLE_SALES') or object.getUser() == user)"),
        new Post(
            security: "is_granted('IS_AUTHENTICATED_FULLY')",
            securityPostDenormalize: "is_granted('ROLE_SALES') or object.getUser() == user",
            processor: ReservationProcessor::class,
            denormalizationContext: ['groups' => ['reservation:create']],
            validationContext: ['groups' => ['Default', 'reservation:create']]
        ),
        new Patch(
            security: "is_granted('IS_AUTHENTICATED_FULLY') and (is_granted('ROLE_SALES') or object.getUser() == user)",
            securityPostDenormalize: "is_granted('ROLE_SALES') or object.getStatus() == 'CANCELLED'",
            processor: ReservationProcessor::class,
            denormalizationContext: ['groups' => ['reservation:status:write']],
            validationContext: ['groups' => ['Default']]
        ),
        new Delete(security: "is_granted('ROLE_SALES')")
    ],
    normalizationContext: ['groups' => ['reservation:read']],
    order: ['id' => 'DESC']
)]
#[NoOverlappingReservation]
#[ApiFilter(SearchFilter::class, properties: ['vehicle' => 'exact', 'vehicle.id' => 'exact', 'status' => 'exact', 'user.id' => 'exact'])]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['reservation:read', 'conversation:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'date')]
    #[Groups(['reservation:read', 'reservation:create', 'reservation:availability:read', 'conversation:read'])]
    #[Assert\NotBlank]
    #[Assert\GreaterThan('today', message: "La fecha de inicio debe ser futura", groups: ['reservation:create'])]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: 'date')]
    #[Groups(['reservation:read', 'reservation:create', 'reservation:availability:read', 'conversation:read'])]
    #[Assert\NotBlank]
    #[Assert\GreaterThan(propertyPath: 'startDate', message: "La fecha fin debe ser posterior a la de inicio", groups: ['reservation:create'])]
    #[Assert\GreaterThanOrEqual('today', message: "No se puede modificar una reserva que ya ha finalizado")]
    private ?\DateTimeInterface $endDate = null;

    #[ORM\Column(length: 20)]
    #[Groups(['reservation:read', 'reservation:status:write', 'reservation:availability:read', 'conversation:read'])]
    #[Assert\Choice(choices: ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'], message: "Estado de reserva no valido")]
    private ?string $status = 'PENDING';

    #[ORM\Column]
    #[Groups(['reservation:read', 'conversation:read'])]
    private ?float $totalPrice = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['reservation:read', 'reservation:create'])]
    private ?Vehicle $vehicle = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['reservation:read', 'reservation:create'])]
    private ?User $user = null;

    // --- MÉTODOS ---
    #[ORM\PrePersist]
    public function calculateTotalPrice(): void
    {
        if ($this->vehicle && $this->startDate && $this->endDate) {
            $diff = $this->startDate->diff($this->endDate);
            $days = $diff->days + 1;

            $pricePerDay = (float) ($this->vehicle->getDailyPrice() ?? 0);
            $this->totalPrice = round($days * $pricePerDay, 2);
        }
    }

    // Getters y Setters...
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->startDate;
    }
    public function setStartDate(\DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->endDate;
    }
    public function setEndDate(\DateTimeInterface $endDate): static
    {
        $this->endDate = $endDate;
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

    public function getTotalPrice(): ?float
    {
        return $this->totalPrice;
    }
    public function setTotalPrice(float $totalPrice): static
    {
        $this->totalPrice = $totalPrice;
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

    public function getUser(): ?User
    {
        return $this->user;
    }
    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }
}
