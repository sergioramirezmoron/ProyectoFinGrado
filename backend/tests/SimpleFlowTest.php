<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

class SimpleFlowTest extends ApiTestCase
{
    public function testCompleteFlow(): void
    {
        $client = static::createClient();

        // 1. LOGIN
        $response = $client->request('POST', '/api/login_check', [
            'json' => [
                'email' => 'ventas1@concesionario.com',
                'password' => '123456',
            ],
        ]);
        $this->assertResponseIsSuccessful();
        $token = $response->toArray()['token'];

        // 2. OBTENER COCHES
        // Buscamos directamente coches de alquiler para ir al grano
        $response = $client->request('GET', '/api/vehicles?type=RENT', [
            'auth_bearer' => $token
        ]);
        $this->assertResponseIsSuccessful();
        
        $data = $response->toArray();

        // CORRECCIÓN AQUÍ: Tu API devuelve 'member', no 'hydra:member'
        $key = isset($data['hydra:member']) ? 'hydra:member' : 'member';
        
        if (!isset($data[$key])) {
             $this->fail('La API no devolvió la lista de coches (ni member ni hydra:member)');
        }

        $vehicles = $data[$key];
        $this->assertNotEmpty($vehicles, 'El filtro ?type=RENT devolvió una lista vacía.');

        // Cogemos el primer coche de alquiler
        $rentVehicleIri = $vehicles[0]['@id'];
        echo "\n¡ÉXITO! Usaremos el coche: $rentVehicleIri\n";

        // 3. BUSCAR UN USUARIO
        $response = $client->request('GET', '/api/users', ['auth_bearer' => $token]);
        $userData = $response->toArray();
        // Usamos la misma lógica para el usuario
        $userKey = isset($userData['hydra:member']) ? 'hydra:member' : 'member';
        $userIri = $userData[$userKey][0]['@id'];

        // 4. CREAR PRIMERA RESERVA (OK) - Año 2030
        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2030-01-01',
                'endDate' => '2030-01-10',
                'vehicle' => $rentVehicleIri,
                'user' => $userIri
            ]
        ]);
        $this->assertResponseStatusCodeSame(201);

        // 5. INTENTAR RESERVAR ENCIMA (FAIL)
        $client->request('POST', '/api/reservations', [
            'auth_bearer' => $token,
            'json' => [
                'startDate' => '2030-01-05',
                'endDate' => '2030-01-15',
                'vehicle' => $rentVehicleIri,
                'user' => $userIri
            ]
        ]);
        
        $this->assertResponseStatusCodeSame(422);
    }
}