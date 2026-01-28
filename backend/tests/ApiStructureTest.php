<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

class ApiStructureTest extends ApiTestCase
{
    public function testVehicleJsonFormat(): void
    {
        $client = static::createClient();

        // 1. LOGIN (Necesitamos token para ver los datos)
        // Usamos ventas1 que sabemos que existe
        $response = $client->request('POST', '/api/login_check', [
            'json' => [
                'email' => 'ventas1@concesionario.com',
                'password' => '123456',
            ],
        ]);
        $token = $response->toArray()['token'];

        // 2. PETICIÓN GET (Pedimos el catálogo)
        $response = $client->request('GET', '/api/vehicles', [
            'auth_bearer' => $token
        ]);
        
        $this->assertResponseIsSuccessful();
        $data = $response->toArray();

        // 3. OBTENER LA LISTA DE COCHES
        $key = isset($data['hydra:member']) ? 'hydra:member' : 'member';
        $vehicles = $data[$key];

        $this->assertNotEmpty($vehicles, 'La BD está vacía, no puedo comprobar la estructura.');

        // 4. ANALIZAR EL PRIMER COCHE
        $vehicle = $vehicles[0];
        
        // A) Comprobamos campos básicos
        $this->assertArrayHasKey('id', $vehicle, 'Falta el ID');
        $this->assertArrayHasKey('price', $vehicle, 'Falta el precio');
        $this->assertArrayHasKey('year', $vehicle, 'Falta el año');
        $this->assertArrayHasKey('type', $vehicle, 'Falta el TIPO (SALE/RENT)');
        $this->assertArrayHasKey('status', $vehicle, 'Falta el estado');

        // B) Comprobamos RELACIONES
        // React espera: vehicle.brand.name
        $this->assertArrayHasKey('brand', $vehicle, 'Falta el objeto Brand');
        $this->assertIsArray($vehicle['brand'], 'Brand debería ser un objeto, no un string');
        $this->assertArrayHasKey('name', $vehicle['brand'], 'Dentro de Brand falta el campo name');

        // React espera: vehicle.model.name
        $this->assertArrayHasKey('model', $vehicle, 'Falta el objeto Model');
        $this->assertIsArray($vehicle['model'], 'Model debería ser un objeto');
        $this->assertArrayHasKey('name', $vehicle['model'], 'Dentro de Model falta el campo name');

        // C) Comprobamos PRECIOS SEGÚN TIPO
        if ($vehicle['type'] === 'RENT') {
            $this->assertArrayHasKey('dailyPrice', $vehicle, 'Es de alquiler pero falta dailyPrice');
            echo "\nVerificado formato para Coche de Alquiler OK";
        } else {
             echo "\nVerificado formato para Coche de Venta OK";
        }
    }
}