<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

class RegistrationTest extends ApiTestCase
{
    public function testUserRegistrationFlow(): void
    {
        $client = static::createClient();
        $email = 'nuevo_usuario_' . uniqid() . '@prueba.com';

        // 1. REGISTRO OK
        $client->request('POST', '/api/users', [
            'json' => [
                'email' => $email,
                'plainPassword' => '123456',
                'name' => 'Usuario',
                'surname' => 'De Prueba',
                'phone' => '600112233'
            ]
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains(['email' => $email]);

        // 2. REGISTRO DUPLICADO
        $client->request('POST', '/api/users', [
            'json' => [
                'email' => $email,
                'plainPassword' => 'otra_password',
                'name' => 'Impostor',
                'surname' => 'Duplicado'
            ]
        ]);

        $this->assertResponseStatusCodeSame(422);

        // 3. MENSAJE DE ERROR
        $this->assertStringContainsString(
            'Este correo electrónico ya está registrado. Inicia sesión o usa otro correo.',
            $client->getResponse()->getContent(false)
        );
    }
}
