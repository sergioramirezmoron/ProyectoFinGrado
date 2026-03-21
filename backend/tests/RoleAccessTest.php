<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

/**
 * Tests de control de acceso por roles (RBAC):
 * - Qué puede hacer un usuario anónimo
 * - Qué puede hacer ROLE_USER
 * - Qué puede hacer ROLE_SALES
 * - Qué puede hacer ROLE_ADMIN
 */
class RoleAccessTest extends ApiTestCase
{
    private function getKey(array $data): string
    {
        return isset($data['hydra:member']) ? 'hydra:member' : 'member';
    }

    private function login(object $client, string $email, string $password): string
    {
        $response = $client->request('POST', '/api/login_check', [
            'json' => ['email' => $email, 'password' => $password],
        ]);
        return $response->toArray()['token'];
    }

    // --- USUARIO ANÓNIMO ---

    public function testAnonymousCanViewPublicVehicleCatalog(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/vehicles');

        $this->assertResponseIsSuccessful();
    }

    public function testAnonymousCannotListConversations(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/conversations');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testAnonymousCannotPostMessage(): void
    {
        // Valida el fix de seguridad: Message pasó de PUBLIC_ACCESS a IS_AUTHENTICATED_FULLY
        $client = static::createClient();

        $client->request('POST', '/api/messages', [
            'json' => [
                'content' => 'Intento de spam anónimo',
                'isAdmin' => false,
                'conversation' => '/api/conversations/1',
            ],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    // --- ROLE_USER (cliente registrado) ---

    public function testRegularUserCannotCreateVehicle(): void
    {
        $client = static::createClient();

        // Registrar usuario nuevo sin rol especial
        $email = 'cliente_test_' . uniqid() . '@test.com';
        $client->request('POST', '/api/users', [
            'json' => [
                'email' => $email,
                'plainPassword' => '123456',
                'name' => 'Cliente',
                'surname' => 'Test',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // Loguearse como ese usuario
        $token = $this->login($client, $email, '123456');

        // Obtener IRIs necesarios (públicos)
        $brands = $client->request('GET', '/api/brands')->toArray();
        $brandIri = $brands[$this->getKey($brands)][0]['@id'];

        $models = $client->request('GET', '/api/models')->toArray();
        $modelIri = $models[$this->getKey($models)][0]['@id'];

        $fuels = $client->request('GET', '/api/fuels')->toArray();
        $fuelIri = $fuels[$this->getKey($fuels)][0]['@id'];

        $transmissions = $client->request('GET', '/api/transmissions')->toArray();
        $transmIri = $transmissions[$this->getKey($transmissions)][0]['@id'];

        // Intentar crear vehículo → debe ser 403
        $client->request('POST', '/api/vehicles', [
            'auth_bearer' => $token,
            'json' => [
                'brand' => $brandIri,
                'model' => $modelIri,
                'year' => 2022,
                'price' => '25000',
                'kilometres' => 0,
                'power' => 150,
                'owners' => 1,
                'status' => 'AVAILABLE',
                'type' => 'SALE',
                'fuelType' => $fuelIri,
                'transmission' => $transmIri,
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testRegularUserCanCreateReservation(): void
    {
        $client = static::createClient();

        // Registrar usuario nuevo
        $email = 'reserva_test_' . uniqid() . '@test.com';
        $client->request('POST', '/api/users', [
            'json' => [
                'email' => $email,
                'plainPassword' => '123456',
                'name' => 'Reservas',
                'surname' => 'Test',
            ],
        ]);
        $userIri = $client->getResponse()->toArray()['@id'];

        $token = $this->login($client, $email, '123456');

        // Buscar un vehículo de alquiler disponible
        $vehicles = $client->request('GET', '/api/vehicles?type=RENT&status=AVAILABLE')->toArray();
        $rentVehicleIri = $vehicles[$this->getKey($vehicles)][0]['@id'];

        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2045-03-01',
                'endDate' => '2045-03-07',
                'vehicle' => $rentVehicleIri,
                'user' => $userIri,
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
    }

    // --- ROLE_SALES ---

    public function testSalesCanCreateVehicle(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'ventas1@concesionario.com', '123456');

        $brands = $client->request('GET', '/api/brands')->toArray();
        $brandIri = $brands[$this->getKey($brands)][0]['@id'];

        $models = $client->request('GET', '/api/models')->toArray();
        $modelIri = $models[$this->getKey($models)][0]['@id'];

        $fuels = $client->request('GET', '/api/fuels')->toArray();
        $fuelIri = $fuels[$this->getKey($fuels)][0]['@id'];

        $transmissions = $client->request('GET', '/api/transmissions')->toArray();
        $transmIri = $transmissions[$this->getKey($transmissions)][0]['@id'];

        $client->request('POST', '/api/vehicles', [
            'auth_bearer' => $token,
            'json' => [
                'brand' => $brandIri,
                'model' => $modelIri,
                'year' => 2023,
                'price' => '45000',
                'kilometres' => 0,
                'power' => 200,
                'owners' => 1,
                'status' => 'AVAILABLE',
                'type' => 'SALE',
                'fuelType' => $fuelIri,
                'transmission' => $transmIri,
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
    }

    public function testSalesCannotDeleteVehicle(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'ventas1@concesionario.com', '123456');

        $vehicles = $client->request('GET', '/api/vehicles', ['auth_bearer' => $token])->toArray();
        $vehicleIri = $vehicles[$this->getKey($vehicles)][0]['@id'];

        $client->request('DELETE', $vehicleIri, ['auth_bearer' => $token]);

        $this->assertResponseStatusCodeSame(403);
    }

    // --- ROLE_ADMIN ---

    public function testAdminCanDeleteVehicle(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'admin@concesionario.com', 'admin');

        // Crear un vehículo nuevo sin reservas para poder borrarlo sin violar FK
        $brands = $client->request('GET', '/api/brands')->toArray();
        $brandIri = $brands[$this->getKey($brands)][0]['@id'];
        $models = $client->request('GET', '/api/models')->toArray();
        $modelIri = $models[$this->getKey($models)][0]['@id'];
        $fuels = $client->request('GET', '/api/fuels')->toArray();
        $fuelIri = $fuels[$this->getKey($fuels)][0]['@id'];
        $transmissions = $client->request('GET', '/api/transmissions')->toArray();
        $transmIri = $transmissions[$this->getKey($transmissions)][0]['@id'];

        $createResponse = $client->request('POST', '/api/vehicles', [
            'auth_bearer' => $token,
            'json' => [
                'brand' => $brandIri,
                'model' => $modelIri,
                'year' => 2024,
                'price' => '99000',
                'kilometres' => 0,
                'power' => 300,
                'owners' => 1,
                'status' => 'AVAILABLE',
                'type' => 'SALE',
                'fuelType' => $fuelIri,
                'transmission' => $transmIri,
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $vehicleIri = $createResponse->toArray()['@id'];

        $client->request('DELETE', $vehicleIri, ['auth_bearer' => $token]);

        $this->assertResponseStatusCodeSame(204);
    }

    public function testAdminCanListAllConversations(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'admin@concesionario.com', 'admin');

        $client->request('GET', '/api/conversations', ['auth_bearer' => $token]);

        $this->assertResponseIsSuccessful();
    }

    // --- DASHBOARD STATS ---

    public function testStatsEndpointReturnsExpectedStructure(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'admin@concesionario.com', 'admin');

        $response = $client->request('GET', '/api/stats', ['auth_bearer' => $token]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();

        $this->assertArrayHasKey('totalUsers', $data);
        $this->assertArrayHasKey('totalVehicles', $data);
        $this->assertArrayHasKey('vehiclesAvailable', $data);
        $this->assertArrayHasKey('vehiclesSold', $data);
        $this->assertArrayHasKey('vehiclesReserved', $data);
        $this->assertArrayHasKey('totalMessages', $data);
        $this->assertArrayHasKey('totalBrands', $data);
        $this->assertArrayHasKey('recentActivity', $data);
        $this->assertIsArray($data['recentActivity']);
        $this->assertGreaterThan(0, $data['totalVehicles']);
        $this->assertGreaterThan(0, $data['totalUsers']);
    }

    public function testStatsVehicleCountsAreConsistent(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'admin@concesionario.com', 'admin');

        $response = $client->request('GET', '/api/stats', ['auth_bearer' => $token]);
        $data = $response->toArray();

        // available + sold + reserved + deleted <= total
        $sum = ($data['vehiclesAvailable'] ?? 0)
            + ($data['vehiclesSold'] ?? 0)
            + ($data['vehiclesReserved'] ?? 0);

        $this->assertLessThanOrEqual(
            $data['totalVehicles'],
            $sum,
            'La suma de estados no puede superar el total de vehículos'
        );
    }
}
