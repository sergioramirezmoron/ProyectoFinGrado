<?php

namespace App\Controller;

use App\Entity\VehicleImage;
use App\Form\VehicleImageType;
use App\Repository\VehicleImageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[IsGranted('ROLE_SALES')]
#[Route('/vehicleimage')]
final class VehicleImageController extends AbstractController
{
    #[Route(name: 'app_vehicle_image_index', methods: ['GET'])]
    public function index(VehicleImageRepository $vehicleImageRepository): Response
    {
        return $this->render('vehicle_image/index.html.twig', [
            'vehicle_images' => $vehicleImageRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_vehicle_image_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager, SluggerInterface $slugger): Response
    {
        $vehicleImage = new VehicleImage();
        $form = $this->createForm(VehicleImageType::class, $vehicleImage);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
             $imgFile = $form->get('filename')->getData();

            if ($imgFile) {
                $directory = $this->getParameter('vehicle_img_directory');
                $originalFilename = pathinfo($imgFile->getClientOriginalName(), PATHINFO_FILENAME);

                $safeFilename = $slugger->slug($originalFilename);
                $newFilename = $safeFilename . '-' . uniqid() . '.' . $imgFile->guessExtension();

                try {
                    $imgFile->move($directory, $newFilename);
                } catch (FileException $e) {
                }

                $vehicleImage->setFilename($newFilename);
            }
            $entityManager->persist($vehicleImage);
            $entityManager->flush();

            return $this->redirectToRoute('app_vehicle_image_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('vehicle_image/new.html.twig', [
            'vehicle_image' => $vehicleImage,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_vehicle_image_show', methods: ['GET'])]
    public function show(VehicleImage $vehicleImage): Response
    {
        return $this->render('vehicle_image/show.html.twig', [
            'vehicle_image' => $vehicleImage,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_vehicle_image_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, VehicleImage $vehicleImage, EntityManagerInterface $entityManager, SluggerInterface $slugger): Response
    {
        $form = $this->createForm(VehicleImageType::class, $vehicleImage);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $imgFile = $form->get('filename')->getData();

        if ($imgFile) {

            $directory = $this->getParameter('vehicle_img_directory');

            $originalFilename = pathinfo($imgFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $imgFile->guessExtension();

            try {
                $imgFile->move($directory, $newFilename);
            } catch (FileException $e) {
            }

            $vehicleImage->setFilename($newFilename);
        }
            $entityManager->flush();

            return $this->redirectToRoute('app_vehicle_image_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('vehicle_image/edit.html.twig', [
            'vehicle_image' => $vehicleImage,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_vehicle_image_delete', methods: ['POST'])]
    public function delete(Request $request, VehicleImage $vehicleImage, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$vehicleImage->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($vehicleImage);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_vehicle_image_index', [], Response::HTTP_SEE_OTHER);
    }
}
