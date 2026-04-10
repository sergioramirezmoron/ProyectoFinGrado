<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260410000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Seed all 52 Spanish provinces';
    }

    public function up(Schema $schema): void
    {
        $provinces = [
            'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias',
            'Ávila', 'Badajoz', 'Barcelona', 'Burgos', 'Cáceres',
            'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba',
            'A Coruña', 'Cuenca', 'Girona', 'Granada', 'Guadalajara',
            'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares', 'Jaén',
            'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo',
            'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense',
            'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia',
            'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo',
            'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza',
            'Ceuta', 'Melilla',
        ];

        foreach ($provinces as $name) {
            $this->addSql(
                "INSERT INTO province (name) SELECT :name WHERE NOT EXISTS (SELECT 1 FROM province WHERE name = :name)",
                ['name' => $name]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // No reversible: provinces added manually by admin should not be deleted
    }
}
