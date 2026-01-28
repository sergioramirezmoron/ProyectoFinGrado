<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

class SecurityAndValidationTest extends ApiTestCase
{
    // PRUEBA 1: SEGURIDAD (El Vendedor intenta borrar -> Prohibido)
    public function testSalesUserCannotDeleteVehicle(): void
    {
        $client = static::createClient();

        // 1. Loguearse como VENDEDOR
        $response = $client->request('POST', '/api/login_check', [
            'json' => [
                'email' => 'ventas1@concesionario.com',
                'password' => '123456',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $token = $response->toArray()['token'];

        // 2. Buscar un coche cualquiera
        $vehicleResponse = $client->request('GET', '/api/vehicles', ['auth_bearer' => $token]);
        $vehicles = $vehicleResponse->toArray();
        $key = isset($vehicles['hydra:member']) ? 'hydra:member' : 'member';

        // Aseguramos que hay coches
        $this->assertNotEmpty($vehicles[$key], 'No hay coches para intentar borrar.');
        $vehicleIri = $vehicles[$key][0]['@id'];

        // 3. INTENTO DE BORRADO
        // El vendedor puede crear, PERO NO borrar. Solo Admin borra.
        $client->request('DELETE', $vehicleIri, [
            'auth_bearer' => $token
        ]);

        // 4. Debe ser 403 Forbidden
        $this->assertResponseStatusCodeSame(403);
    }

    // PRUEBA 2: VALIDACIÓN (Datos Inválidos) 
    public function testCannotCreateInvalidVehicle(): void
    {
        $client = static::createClient();

        // 1. Loguearse como VENDEDOR
        $response = $client->request('POST', '/api/login_check', [
            'json' => [
                'email' => 'ventas1@concesionario.com',
                'password' => '123456',
            ],
        ]);
        $token = $response->toArray()['token'];

        // 2. Obtener IDs válidos para relaciones
        $brands = $client->request('GET', '/api/brands', ['auth_bearer' => $token])->toArray();
        $keyBrand = isset($brands['hydra:member']) ? 'hydra:member' : 'member';
        $brandIri = $brands[$keyBrand][0]['@id'];

        $models = $client->request('GET', '/api/models', ['auth_bearer' => $token])->toArray();
        $keyModel = isset($models['hydra:member']) ? 'hydra:member' : 'member';
        $modelIri = $models[$keyModel][0]['@id'];

        // 3. Intentar crear un coche con PRECIO NEGATIVO
        $client->request('POST', '/api/vehicles', [
            'auth_bearer' => $token,
            'json' => [
                'brand' => $brandIri,
                'model' => $modelIri,
                'year' => 2025,
                'price' => -5000,     // <--- EL ERROR QUE QUEREMOS PROBAR
                'kilometres' => 0,
                'status' => 'AVAILABLE',
                'province' => '/api/provinces/1',
                'fuelType' => '/api/fuels/1',
                'transmission' => '/api/transmissions/1',
                'bodyType' => '/api/body_types/1',
                'enviromentalBadge' => '/api/enviromental_badges/1',
                'color' => '/api/colors/1',
                'type' => 'SALE',
                'power' => 150,
                'doors' => 5,
                'owners' => 1
            ]
        ]);

        // 4. EL VEREDICTO: Debe ser 422 Unprocessable Entity
        $this->assertResponseStatusCodeSame(422);
    }

    // PRUEBA 3: (Error 404) 
    public function testGetNonExistentResource(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/vehicles/99999999');
        $this->assertResponseStatusCodeSame(404);
    }
}
