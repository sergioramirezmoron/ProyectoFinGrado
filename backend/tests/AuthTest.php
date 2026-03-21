<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

/**
 * Tests del sistema de autenticación JWT:
 * - Login correcto/incorrecto
 * - Estructura del token
 * - Acceso a endpoints protegidos
 */
class AuthTest extends ApiTestCase
{
    // --- LOGIN ---

    public function testLoginWithValidAdminCredentialsReturnsToken(): void
    {
        $client = static::createClient();

        $response = $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'admin@concesionario.com', 'password' => 'admin'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertArrayHasKey('token', $data, 'La respuesta debe contener un token JWT');
        $this->assertNotEmpty($data['token']);
    }

    public function testLoginWithValidSalesCredentialsReturnsToken(): void
    {
        $client = static::createClient();

        $response = $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'ventas1@concesionario.com', 'password' => '123456'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertArrayHasKey('token', $response->toArray());
    }

    public function testLoginWithWrongPasswordReturns401(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'admin@concesionario.com', 'password' => 'contraseña_incorrecta'],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testLoginWithNonExistentEmailReturns401(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'usuario_fantasma@test.com', 'password' => '123456'],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testLoginWithEmptyBodyReturns4xx(): void
    {
        $client = static::createClient();

        // json:[] envía [] (array JSON), que JsonLoginAuthenticator rechaza con 400
        $client->request('POST', '/api/login_check', ['json' => []]);

        $this->assertThat(
            $client->getResponse()->getStatusCode(),
            $this->logicalOr($this->equalTo(400), $this->equalTo(401))
        );
    }

    // --- ESTRUCTURA DEL JWT ---

    public function testJwtTokenHasThreeParts(): void
    {
        $client = static::createClient();

        $response = $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'admin@concesionario.com', 'password' => 'admin'],
        ]);

        $token = $response->toArray()['token'];
        $parts = explode('.', $token);

        $this->assertCount(3, $parts, 'El JWT debe tener 3 partes: header.payload.signature');
    }

    public function testJwtPayloadContainsUserDataAndRoles(): void
    {
        $client = static::createClient();

        $response = $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'admin@concesionario.com', 'password' => 'admin'],
        ]);

        $token = $response->toArray()['token'];
        $parts = explode('.', $token);

        // Decodifica el payload (segunda parte, base64url)
        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

        // Lexik JWT almacena el identificador como 'username'
        $this->assertArrayHasKey('username', $payload, 'El JWT debe incluir el username (email)');
        $this->assertArrayHasKey('roles', $payload, 'El JWT debe incluir los roles');
        // JWTCreatedListener añade id, name, phone
        $this->assertArrayHasKey('id', $payload, 'El JWT debe incluir el id del usuario');
        $this->assertContains('ROLE_ADMIN', $payload['roles'], 'El admin debe tener ROLE_ADMIN en el token');
        $this->assertEquals('admin@concesionario.com', $payload['username']);
    }

    public function testJwtPayloadOfSalesUserContainsSalesRole(): void
    {
        $client = static::createClient();

        $response = $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'ventas1@concesionario.com', 'password' => '123456'],
        ]);

        $token = $response->toArray()['token'];
        $parts = explode('.', $token);
        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

        $this->assertContains('ROLE_SALES', $payload['roles']);
    }

    // --- ACCESO A ENDPOINTS PROTEGIDOS ---

    public function testConversationsEndpointRequiresAuthentication(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/conversations');

        $this->assertResponseStatusCodeSame(401, 'Las conversaciones deben requerir autenticación');
    }

    public function testAuthenticatedUserCanAccessConversations(): void
    {
        $client = static::createClient();

        $tokenResponse = $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'admin@concesionario.com', 'password' => 'admin'],
        ]);
        $token = $tokenResponse->toArray()['token'];

        $client->request('GET', '/api/conversations', ['auth_bearer' => $token]);

        $this->assertResponseIsSuccessful();
    }

    public function testPublicVehicleCatalogDoesNotRequireAuthentication(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/vehicles');

        $this->assertResponseIsSuccessful();
    }

    public function testInvalidTokenReturns401(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/conversations', [
            'auth_bearer' => 'esto.no.es.un.token.valido',
        ]);

        $this->assertResponseStatusCodeSame(401);
    }
}
