<?php

namespace App\Controller;

use App\Entity\EnviromentalBadge;
use App\Form\EnviromentalBadgeType;
use App\Repository\EnviromentalBadgeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[IsGranted('ROLE_ADMIN')]
#[Route('/enviromentalbadge')]
final class EnviromentalBadgeController extends AbstractController
{
    #[Route(name: 'app_enviromental_badge_index', methods: ['GET'])]
    public function index(EnviromentalBadgeRepository $enviromentalBadgeRepository): Response
    {
        return $this->render('enviromental_badge/index.html.twig', [
            'enviromental_badges' => $enviromentalBadgeRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_enviromental_badge_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager, SluggerInterface $slugger): Response
    {
        $enviromentalBadge = new EnviromentalBadge();
        $form = $this->createForm(EnviromentalBadgeType::class, $enviromentalBadge);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $imgFile = $form->get('image')->getData();

            if ($imgFile) {
                $directory = $this->getParameter('enviromental_badge_directory');
                $originalFilename = pathinfo($imgFile->getClientOriginalName(), PATHINFO_FILENAME);

                $safeFilename = $slugger->slug($originalFilename);
                $newFilename = $safeFilename . '-' . uniqid() . '.' . $imgFile->guessExtension();

                try {
                    $imgFile->move($directory, $newFilename);
                } catch (FileException $e) {
                }

                $enviromentalBadge->setImage($newFilename);
            }
            $entityManager->persist($enviromentalBadge);
            $entityManager->flush();

            return $this->redirectToRoute('app_enviromental_badge_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('enviromental_badge/new.html.twig', [
            'enviromental_badge' => $enviromentalBadge,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_enviromental_badge_show', methods: ['GET'])]
    public function show(EnviromentalBadge $enviromentalBadge): Response
    {
        return $this->render('enviromental_badge/show.html.twig', [
            'enviromental_badge' => $enviromentalBadge,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_enviromental_badge_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, EnviromentalBadge $enviromentalBadge, EntityManagerInterface $entityManager, SluggerInterface $slugger): Response
    {
        $form = $this->createForm(EnviromentalBadgeType::class, $enviromentalBadge);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $imgFile = $form->get('image')->getData();

        if ($imgFile) {

            $directory = $this->getParameter('enviromental_badge_directory');

            $originalFilename = pathinfo($imgFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $imgFile->guessExtension();

            try {
                $imgFile->move($directory, $newFilename);
            } catch (FileException $e) {
            }

            $enviromentalBadge->setImage($newFilename);
        }

            $entityManager->flush();

            return $this->redirectToRoute('app_enviromental_badge_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('enviromental_badge/edit.html.twig', [
            'enviromental_badge' => $enviromentalBadge,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_enviromental_badge_delete', methods: ['POST'])]
    public function delete(Request $request, EnviromentalBadge $enviromentalBadge, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete' . $enviromentalBadge->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($enviromentalBadge);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_enviromental_badge_index', [], Response::HTTP_SEE_OTHER);
    }
}
