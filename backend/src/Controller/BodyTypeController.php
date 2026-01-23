<?php

namespace App\Controller;

use App\Entity\BodyType;
use App\Form\BodyTypeType;
use App\Repository\BodyTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/body/type')]
final class BodyTypeController extends AbstractController
{
    #[Route(name: 'app_body_type_index', methods: ['GET'])]
    public function index(BodyTypeRepository $bodyTypeRepository): Response
    {
        return $this->render('body_type/index.html.twig', [
            'body_types' => $bodyTypeRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_body_type_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $bodyType = new BodyType();
        $form = $this->createForm(BodyTypeType::class, $bodyType);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($bodyType);
            $entityManager->flush();

            return $this->redirectToRoute('app_body_type_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('body_type/new.html.twig', [
            'body_type' => $bodyType,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_body_type_show', methods: ['GET'])]
    public function show(BodyType $bodyType): Response
    {
        return $this->render('body_type/show.html.twig', [
            'body_type' => $bodyType,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_body_type_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, BodyType $bodyType, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(BodyTypeType::class, $bodyType);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_body_type_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('body_type/edit.html.twig', [
            'body_type' => $bodyType,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_body_type_delete', methods: ['POST'])]
    public function delete(Request $request, BodyType $bodyType, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$bodyType->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($bodyType);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_body_type_index', [], Response::HTTP_SEE_OTHER);
    }
}
