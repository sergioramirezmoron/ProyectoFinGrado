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
#[Route('/api/stats', name: 'api_stats', methods: ['GET'])]
class GetDashboardStatsAction extends AbstractController
{
    public function __invoke(
        UserRepository $userRepo,
        VehicleRepository $vehicleRepo,
        MessageRepository $messageRepo,
        BrandRepository $brandRepo
    ): JsonResponse {

        $latestMessages = $messageRepo->findBy(
            ['isAdmin' => false],
            ['createdAt' => 'DESC'],
            5
        );

        $activities = [];

        foreach ($latestMessages as $msg) {

            $content = $msg->getContent();
            if (strlen($content) > 40) {
                $content = substr($content, 0, 40) . '...';
            }

            $activities[] = [
                'type' => 'MESSAGE',
                'text' => 'Mensaje en chat #' . $msg->getConversation()->getId() . ': "' . $content . '"',
                'date' => $msg->getCreatedAt()->format('c')
            ];
        }

        // 2. DEVOLVER RESPUESTA COMPLETA
        return new JsonResponse([
            'totalUsers' => $userRepo->count([]),
            'totalVehicles' => $vehicleRepo->count([]),
            'vehiclesAvailable' => $vehicleRepo->count(['status' => 'AVAILABLE']),
            'vehiclesSold' => $vehicleRepo->count(['status' => 'SOLD']),
            'vehiclesReserved' => $vehicleRepo->count(['status' => 'RESERVED']),
            'totalMessages' => $messageRepo->count([]),
            'totalBrands' => $brandRepo->count([]),
            'recentActivity' => $activities,
            'serverTime' => new \DateTime()
        ]);
    }
}
