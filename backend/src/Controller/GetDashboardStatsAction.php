<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\VehicleRepository;
use App\Repository\MessageRepository;
use App\Repository\BrandRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Attribute\AsController;

#[AsController]
class GetDashboardStatsAction extends AbstractController
{
    public function __invoke(
        UserRepository $userRepo,
        VehicleRepository $vehicleRepo,
        MessageRepository $messageRepo,
        BrandRepository $brandRepo
    ): JsonResponse {
        $usersCount = $userRepo->count([]);
        $vehiclesCount = $vehicleRepo->count([]);
        $messagesCount = $messageRepo->count([]);
        $brandsCount = $brandRepo->count([]);
        $soldVehicles = $vehicleRepo->count(['status' => 'SOLD']);
        $reservedVehicles = $vehicleRepo->count(['status' => 'RESERVED']);

        $availableVehicles = $vehicleRepo->count(['status' => 'AVAILABLE']);

        return new JsonResponse([
            'totalUsers' => $usersCount,
            'totalVehicles' => $vehiclesCount,
            'vehiclesAvailable' => $availableVehicles,
            'vehiclesSold' => $soldVehicles,
            'vehiclesReserved' => $reservedVehicles,
            'totalMessages' => $messagesCount,
            'totalBrands' => $brandsCount,
            'serverTime' => new \DateTime()
        ]);
    }
}
