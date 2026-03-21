<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

/**
 * Tests de filtros, ordenación y paginación del catálogo de vehículos.
 */
class FiltersTest extends ApiTestCase
{
    private function getKey(array $data): string
    {
        return isset($data['hydra:member']) ? 'hydra:member' : 'member';
    }

    // --- FILTROS POR TIPO ---

    public function testFilterBySaleTypeReturnsOnlySaleVehicles(): void
    {
        $client = static::createClient();

        $response = $client->request('GET', '/api/vehicles?type=SALE');
        $this->assertResponseIsSuccessful();

        $data = $response->toArray();
        $vehicles = $data[$this->getKey($data)];
        $this->assertNotEmpty($vehicles, 'Debe haber vehículos de tipo SALE');

        foreach ($vehicles as $vehicle) {
            $this->assertEquals('SALE', $vehicle['type'], 'Todos los resultados deben ser tipo SALE');
        }
    }

    public function testFilterByRentTypeReturnsOnlyRentVehicles(): void
    {
        $client = static::createClient();

        $response = $client->request('GET', '/api/vehicles?type=RENT');
        $this->assertResponseIsSuccessful();

        $data = $response->toArray();
        $vehicles = $data[$this->getKey($data)];
        $this->assertNotEmpty($vehicles, 'Debe haber vehículos de tipo RENT');

        foreach ($vehicles as $vehicle) {
            $this->assertEquals('RENT', $vehicle['type'], 'Todos los resultados deben ser tipo RENT');
            $this->assertArrayHasKey('dailyPrice', $vehicle, 'Los vehículos de alquiler deben tener dailyPrice');
        }
    }

    // --- FILTROS POR ESTADO ---

    public function testFilterByAvailableStatusReturnsOnlyAvailableVehicles(): void
    {
        $client = static::createClient();

        $response = $client->request('GET', '/api/vehicles?status=AVAILABLE');
        $this->assertResponseIsSuccessful();

        $data = $response->toArray();
        $vehicles = $data[$this->getKey($data)];
        $this->assertNotEmpty($vehicles, 'Debe haber vehículos disponibles');

        foreach ($vehicles as $vehicle) {
            $this->assertEquals('AVAILABLE', $vehicle['status'], 'Solo deben aparecer vehículos AVAILABLE');
        }
    }

    public function testDeletedVehiclesNeverAppearInPublicCatalog(): void
    {
        // El HideDeletedVehiclesExtension debe filtrar los DELETED de todas las páginas
        $client = static::createClient();

        $adminResponse = $client->request('POST', '/api/login_check', [
            'json' => ['email' => 'admin@concesionario.com', 'password' => 'admin'],
        ]);
        $token = $adminResponse->toArray()['token'];

        // Crear un vehículo con estado DELETED directamente
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
                'year' => 2022,
                'price' => '30000',
                'kilometres' => 0,
                'power' => 200,
                'owners' => 1,
                'status' => 'DELETED',
                'type' => 'SALE',
                'fuelType' => $fuelIri,
                'transmission' => $transmIri,
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $deletedVehicleId = $createResponse->toArray()['id'];

        // El catálogo público NO debe contenerlo (se ordena por createdAt DESC → estaría en pág.1)
        $catalogResponse = $client->request('GET', '/api/vehicles');
        $catalogData = $catalogResponse->toArray();
        $vehicles = $catalogData[$this->getKey($catalogData)];

        $foundIds = array_column($vehicles, 'id');
        $this->assertNotContains(
            $deletedVehicleId,
            $foundIds,
            'Los vehículos con estado DELETED no deben aparecer en el catálogo público'
        );
    }

    // --- PAGINACIÓN ---

    public function testVehiclePaginationDefaultsToMaxTwentyItems(): void
    {
        $client = static::createClient();

        $response = $client->request('GET', '/api/vehicles');
        $this->assertResponseIsSuccessful();

        $data = $response->toArray();
        $vehicles = $data[$this->getKey($data)];

        $this->assertLessThanOrEqual(
            20,
            count($vehicles),
            'La paginación por defecto debe retornar máximo 20 vehículos'
        );
    }

    public function testPaginationTotalItemsIsProvided(): void
    {
        $client = static::createClient();

        $response = $client->request('GET', '/api/vehicles');
        $this->assertResponseIsSuccessful();

        $data = $response->toArray();

        $totalKey = isset($data['hydra:totalItems']) ? 'hydra:totalItems' : 'totalItems';
        $this->assertArrayHasKey(
            $totalKey,
            $data,
            'La respuesta debe incluir el total de items para paginación en el frontend'
        );
        $this->assertGreaterThan(0, $data[$totalKey]);
    }

    // --- ORDENACIÓN ---

    public function testOrderByPriceAscending(): void
    {
        $client = static::createClient();

        $response = $client->request('GET', '/api/vehicles?type=SALE&order[price]=asc');
        $this->assertResponseIsSuccessful();

        $data = $response->toArray();
        $vehicles = $data[$this->getKey($data)];

        if (count($vehicles) < 2) {
            $this->markTestSkipped('Se necesitan al menos 2 vehículos de venta para verificar el ordenamiento');
        }

        $prices = array_values(array_filter(array_column($vehicles, 'price'), fn($p) => $p !== null));

        for ($i = 1; $i < count($prices); $i++) {
            $this->assertLessThanOrEqual(
                (float) $prices[$i],
                (float) $prices[$i - 1],
                sprintf('Precio[%d]=%s debe ser <= Precio[%d]=%s', $i - 1, $prices[$i - 1], $i, $prices[$i])
            );
        }
    }

    public function testOrderByPriceDescending(): void
    {
        $client = static::createClient();

        $response = $client->request('GET', '/api/vehicles?type=SALE&order[price]=desc');
        $this->assertResponseIsSuccessful();

        $data = $response->toArray();
        $vehicles = $data[$this->getKey($data)];

        if (count($vehicles) < 2) {
            $this->markTestSkipped('Se necesitan al menos 2 vehículos de venta para verificar el ordenamiento descendente');
        }

        $prices = array_values(array_filter(array_column($vehicles, 'price'), fn($p) => $p !== null));

        for ($i = 1; $i < count($prices); $i++) {
            $this->assertGreaterThanOrEqual(
                (float) $prices[$i],
                (float) $prices[$i - 1],
                sprintf('Precio[%d]=%s debe ser >= Precio[%d]=%s', $i - 1, $prices[$i - 1], $i, $prices[$i])
            );
        }
    }

    // --- COMBINACIÓN DE FILTROS ---

    public function testCombinedFilterTypeAndStatus(): void
    {
        $client = static::createClient();

        $response = $client->request('GET', '/api/vehicles?type=RENT&status=AVAILABLE');
        $this->assertResponseIsSuccessful();

        $data = $response->toArray();
        $vehicles = $data[$this->getKey($data)];

        foreach ($vehicles as $vehicle) {
            $this->assertEquals('RENT', $vehicle['type']);
            $this->assertEquals('AVAILABLE', $vehicle['status']);
        }
    }
}
