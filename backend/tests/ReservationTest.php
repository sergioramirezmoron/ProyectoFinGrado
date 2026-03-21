<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

/**
 * Tests de la lógica de negocio de reservas:
 * - Validaciones de fechas
 * - Solapamiento de reservas
 * - Cancelación y liberación de fechas
 * - Creación automática de conversación al reservar
 */
class ReservationTest extends ApiTestCase
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

    private function getRentVehicleIri(object $client, string $token): string
    {
        $vehicles = $client->request('GET', '/api/vehicles?type=RENT&status=AVAILABLE', [
            'auth_bearer' => $token,
        ])->toArray();
        return $vehicles[$this->getKey($vehicles)][0]['@id'];
    }

    private function getUserIri(object $client, string $token): string
    {
        $users = $client->request('GET', '/api/users', [
            'auth_bearer' => $token,
        ])->toArray();
        return $users[$this->getKey($users)][0]['@id'];
    }

    // --- VALIDACIONES DE FECHAS ---

    public function testCannotCreateReservationWithPastStartDate(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'ventas1@concesionario.com', '123456');

        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2020-01-01',  // fecha en el pasado
                'endDate' => '2020-01-10',
                'vehicle' => $this->getRentVehicleIri($client, $token),
                'user' => $this->getUserIri($client, $token),
            ],
        ]);

        $this->assertResponseStatusCodeSame(422, 'No se debe poder reservar con fecha de inicio en el pasado');
    }

    public function testCannotCreateReservationWithEndBeforeStart(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'ventas1@concesionario.com', '123456');

        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2050-06-10',
                'endDate' => '2050-06-01',  // anterior al inicio
                'vehicle' => $this->getRentVehicleIri($client, $token),
                'user' => $this->getUserIri($client, $token),
            ],
        ]);

        $this->assertResponseStatusCodeSame(422, 'La fecha de fin no puede ser anterior a la de inicio');
    }

    public function testCannotCreateReservationWithSameStartAndEndDate(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'ventas1@concesionario.com', '123456');

        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2050-08-01',
                'endDate' => '2050-08-01',  // mismo día
                'vehicle' => $this->getRentVehicleIri($client, $token),
                'user' => $this->getUserIri($client, $token),
            ],
        ]);

        $this->assertResponseStatusCodeSame(422, 'La fecha de fin debe ser posterior a la de inicio');
    }

    // --- SOLAPAMIENTO DE RESERVAS ---

    public function testConfirmedReservationBlocksSameDates(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'ventas1@concesionario.com', '123456');
        $vehicleIri = $this->getRentVehicleIri($client, $token);
        $userIri = $this->getUserIri($client, $token);

        // Crear primera reserva
        $response = $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2051-02-01',
                'endDate' => '2051-02-10',
                'vehicle' => $vehicleIri,
                'user' => $userIri,
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $reservationIri = $response->toArray()['@id'];

        // Confirmar la primera reserva
        $client->request('PATCH', $reservationIri, [
            'auth_bearer' => $token,
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'body' => json_encode(['status' => 'CONFIRMED']),
        ]);
        $this->assertResponseIsSuccessful();

        // Intentar solapar con la confirmada → debe fallar
        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2051-02-05',
                'endDate' => '2051-02-15',
                'vehicle' => $vehicleIri,
                'user' => $userIri,
            ],
        ]);

        $this->assertResponseStatusCodeSame(422, 'Una reserva confirmada debe bloquear las mismas fechas');
    }

    // --- CANCELACIÓN Y LIBERACIÓN DE FECHAS ---

    public function testCanCancelAReservation(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'ventas1@concesionario.com', '123456');

        $response = $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2052-05-01',
                'endDate' => '2052-05-07',
                'vehicle' => $this->getRentVehicleIri($client, $token),
                'user' => $this->getUserIri($client, $token),
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $reservationIri = $response->toArray()['@id'];

        // Cancelar
        $client->request('PATCH', $reservationIri, [
            'auth_bearer' => $token,
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'body' => json_encode(['status' => 'CANCELLED']),
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertEquals('CANCELLED', $client->getResponse()->toArray()['status']);
    }

    public function testCancelledReservationFreesUpDates(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'ventas1@concesionario.com', '123456');
        $vehicleIri = $this->getRentVehicleIri($client, $token);
        $userIri = $this->getUserIri($client, $token);

        // 1. Crear y confirmar primera reserva
        $response = $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2053-09-01',
                'endDate' => '2053-09-10',
                'vehicle' => $vehicleIri,
                'user' => $userIri,
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $reservationIri = $response->toArray()['@id'];

        $client->request('PATCH', $reservationIri, [
            'auth_bearer' => $token,
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'body' => json_encode(['status' => 'CONFIRMED']),
        ]);

        // 2. Verificar que las mismas fechas están bloqueadas
        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2053-09-01',
                'endDate' => '2053-09-10',
                'vehicle' => $vehicleIri,
                'user' => $userIri,
            ],
        ]);
        $this->assertResponseStatusCodeSame(422);

        // 3. Cancelar la primera reserva
        $client->request('PATCH', $reservationIri, [
            'auth_bearer' => $token,
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'body' => json_encode(['status' => 'CANCELLED']),
        ]);

        // 4. Ahora las mismas fechas deben quedar libres
        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2053-09-01',
                'endDate' => '2053-09-10',
                'vehicle' => $vehicleIri,
                'user' => $userIri,
            ],
        ]);
        $this->assertResponseStatusCodeSame(
            201,
            'Tras cancelar la reserva, las mismas fechas deben quedar disponibles'
        );
    }

    // --- CREACIÓN AUTOMÁTICA DE CONVERSACIÓN ---

    public function testCreatingReservationAutomaticallyCreatesConversation(): void
    {
        $client = static::createClient();
        $token = $this->login($client, 'admin@concesionario.com', 'admin');

        $vehicleIri = $this->getRentVehicleIri($client, $token);
        $userIri = $this->getUserIri($client, $token);

        // Contar conversaciones antes
        $before = $client->request('GET', '/api/conversations', ['auth_bearer' => $token])->toArray();
        $countBefore = $before['hydra:totalItems'] ?? count($before[$this->getKey($before)]);

        // Crear reserva
        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2054-11-01',
                'endDate' => '2054-11-05',
                'vehicle' => $vehicleIri,
                'user' => $userIri,
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // Verificar que se creó una conversación nueva
        $after = $client->request('GET', '/api/conversations', ['auth_bearer' => $token])->toArray();
        $countAfter = $after['hydra:totalItems'] ?? count($after[$this->getKey($after)]);

        $this->assertGreaterThan(
            $countBefore,
            $countAfter,
            'Crear una reserva debe generar automáticamente una conversación'
        );
    }
}
