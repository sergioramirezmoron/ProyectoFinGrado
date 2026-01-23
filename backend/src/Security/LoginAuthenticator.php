<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse; // <--- CAMBIO IMPORTANTE
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractLoginFormAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

class LoginAuthenticator extends AbstractLoginFormAuthenticator
{
    public const LOGIN_ROUTE = 'app_login';

    public function __construct(private UrlGeneratorInterface $urlGenerator) {}

    public function authenticate(Request $request): Passport
    {
        $email = $request->getPayload()->getString('email');

        // --- BORRADO: $request->getSession()->set(...) ---
        // En una API no guardamos el "último usuario" en sesión.

        return new Passport(
            new UserBadge($email),
            new PasswordCredentials($request->getPayload()->getString('password')),
            [
                // Sin CSRF ni RememberMe
            ]
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // --- CAMBIO RADICAL PARA REACT ---
        // 1. Borramos la lógica de getTargetPath (usaba sesión).
        // 2. Borramos el RedirectResponse (React no quiere redirecciones).
        // 3. Devolvemos un JSON limpio.
        
        return new JsonResponse([
            'message' => 'Login satisfactorio',
            'user' => $token->getUserIdentifier(),
            // Aquí en el futuro meteremos el Token JWT
        ]);
    }

    protected function getLoginUrl(Request $request): string
    {
        return $this->urlGenerator->generate(self::LOGIN_ROUTE);
    }
}