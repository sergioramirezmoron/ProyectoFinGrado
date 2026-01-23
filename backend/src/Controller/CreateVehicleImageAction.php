<?php

namespace App\Controller;

use App\Entity\Vehicle;
use App\Entity\VehicleImage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response; // <--- Importante
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[AsController]
final class CreateVehicleImageAction extends AbstractController
{
    // Cambiamos el tipo de retorno a Response
    public function __invoke(Request $request, EntityManagerInterface $entityManager): Response
    {
        // 1. Recogemos el archivo
        $uploadedFile = $request->files->get('file');
        
        // 2. Recogemos los datos
        $vehicleIri = $request->request->get('vehicle');
        // El isMain viene como string "true"/"false", hay que convertirlo
        $isMain = $request->request->get('isMain') === 'true'; 

        if (!$uploadedFile) {
            throw new BadRequestHttpException('No se ha enviado ningún archivo "file"');
        }
        if (!$vehicleIri) {
            throw new BadRequestHttpException('No se ha enviado el campo "vehicle"');
        }

        // 3. Buscamos el vehículo
        $vehicleId = basename($vehicleIri); 
        $vehicle = $entityManager->getRepository(Vehicle::class)->find($vehicleId);

        if (!$vehicle) {
            throw new BadRequestHttpException('El vehículo no existe');
        }

        // 4. Subimos el archivo
        $destination = $this->getParameter('kernel.project_dir') . '/public/images/vehicles';
        $newFilename = uniqid() . '.' . $uploadedFile->guessExtension();

        try {
            $uploadedFile->move($destination, $newFilename);
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Error al subir la imagen: ' . $e->getMessage());
        }

        // 5. Creamos la entidad
        $vehicleImage = new VehicleImage();
        $vehicleImage->setFilename($newFilename);
        $vehicleImage->setVehicle($vehicle);
        $vehicleImage->setIsMain($isMain);

        // --- CAMBIO CLAVE AQUÍ ---
        
        // 6. Guardamos manualmente en BD (porque rompemos el flujo automático)
        $entityManager->persist($vehicleImage);
        $entityManager->flush();

        // 7. Devolvemos una respuesta JSON manual (Código 201 Created)
        // Usamos los 'groups' para que solo devuelva los datos que queremos ver
        return $this->json(
            $vehicleImage, 
            201, 
            [], 
            ['groups' => ['vehicleImage:read', 'vehicle:read']]
        );
    }
}