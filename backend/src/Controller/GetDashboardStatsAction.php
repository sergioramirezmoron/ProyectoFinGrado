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
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[AsController]
#[IsGranted('ROLE_SALES')]
#[Route('/api/stats', name: 'api_stats', methods: ['GET'])]
class GetDashboardStatsAction extends AbstractController
{
    public function __invoke(
        UserRepository $userRepo,
        VehicleRepository $vehicleRepo,
        MessageRepository $messageRepo,
        BrandRepository $brandRepo
    ): JsonResponse {

        // Una sola query con GROUP BY en lugar de 4 COUNT separados
        $vehicleCounts = $vehicleRepo->countByStatus();

        // JOIN FETCH para evitar N+1 al acceder a getConversation()
        $latestMessages = $messageRepo->findRecentClientMessages(5);

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

        return new JsonResponse([
            'totalUsers' => $userRepo->count([]),
            'totalVehicles' => $vehicleCounts['total'],
            'vehiclesAvailable' => $vehicleCounts['AVAILABLE'] ?? 0,
            'vehiclesSold' => $vehicleCounts['SOLD'] ?? 0,
            'vehiclesReserved' => $vehicleCounts['RESERVED'] ?? 0,
            'totalMessages' => $messageRepo->count([]),
            'totalBrands' => $brandRepo->count([]),
            'recentActivity' => $activities,
            'serverTime' => new \DateTime()
        ]);
    }
}
