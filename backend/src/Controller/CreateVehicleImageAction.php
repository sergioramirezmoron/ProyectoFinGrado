<?php

namespace App\Controller;

use App\Entity\VehicleImage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[AsController]
final class CreateVehicleImageAction extends AbstractController
{
    public function __invoke(Request $request, EntityManagerInterface $entityManager): Response
    {
        // 1. Recogemos el archivo
        $uploadedFile = $request->files->get('file');
        
        // 2. Recogemos si es portada (React envía 'main', NO 'isMain')
        $isMain = $request->request->get('main') === '1' || $request->request->get('main') === 'true';

        if (!$uploadedFile) {
            throw new BadRequestHttpException('No se ha enviado ningún archivo');
        }

        // 3. Subimos el archivo
        $destination = $this->getParameter('kernel.project_dir') . '/public/images/vehicles';
        $newFilename = uniqid() . '.' . $uploadedFile->guessExtension();

        try {
            $uploadedFile->move($destination, $newFilename);
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Error al subir la imagen: ' . $e->getMessage());
        }

        // 4. Creamos la entidad sin vehiculo asociado
        $vehicleImage = new VehicleImage();
        $vehicleImage->setFilename($newFilename);
        $vehicleImage->setIsMain($isMain);

        // 5. Guardamos en BD
        $entityManager->persist($vehicleImage);
        $entityManager->flush();

        // 6. Devolvemos la respuesta
        return $this->json(
            $vehicleImage, 
            201, 
            [], 
            ['groups' => ['vehicleImage:read']]
        );
    }
}