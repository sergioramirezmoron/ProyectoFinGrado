<?php

namespace App\DataFixtures;

use App\Entity\Brand;
use App\Entity\Model;
use App\Entity\Vehicle;
use App\Entity\User;
use App\Entity\Reservation;
use App\Entity\Fuel;
use App\Entity\Transmission;
use App\Entity\Province;
use App\Entity\BodyType;
use App\Entity\Color;
use App\Entity\EnviromentalBadge;
use App\Entity\VehicleImage; 
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Faker\Factory;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('es_ES');

        // 1. ADMIN
        $admin = new User();
        $admin->setEmail('admin@concesionario.com');
        $admin->setName('Admin');
        $admin->setSurname('Gerente');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin'));
        $manager->persist($admin);

        // 2. EQUIPO DE VENTAS
        $salesTeam = [];
        for ($i = 1; $i <= 3; $i++) {
            $salesMan = new User();
            $salesMan->setEmail("ventas{$i}@concesionario.com");
            $salesMan->setName("Vendedor");
            $salesMan->setSurname((string)$i);
            $salesMan->setRoles(['ROLE_SALES']);
            $salesMan->setPassword($this->passwordHasher->hashPassword($salesMan, '123456'));
            $manager->persist($salesMan);
            $salesTeam[] = $salesMan;
        }

        // 3. CLIENTES
        $users = [];
        for ($i = 0; $i < 30; $i++) {
            $user = new User();
            $user->setEmail($faker->email());
            $user->setName($faker->firstName());
            $user->setSurname($faker->lastName());
            $user->setPhone($faker->mobileNumber());
            $user->setPassword($this->passwordHasher->hashPassword($user, '123456'));
            $manager->persist($user);
            $users[] = $user;
        }

        // 4. CATÁLOGOS
        $brandsData = [
            'BMW' => ['Serie 1', 'Serie 3', 'X5', 'M4'],
            'Audi' => ['A3', 'A4', 'Q7', 'RS6'],
            'Mercedes' => ['Clase A', 'Clase C', 'GLA', 'AMG GT'],
            'Volkswagen' => ['Golf', 'Polo', 'Tiguan'],
            'Toyota' => ['Corolla', 'Yaris', 'RAV4'],
            'Ford' => ['Focus', 'Fiesta', 'Mustang']
        ];

        $modelObjects = [];
        $fuelObjects = [];
        $transmissionObjects = [];
        $provinceObjects = [];
        $badgeObjects = [];
        $colorObjects = [];
        $bodyTypeObjects = [];

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
        foreach ($provinces as $prov) {
            $p = new Province();
            $p->setName($prov);
            $manager->persist($p);
            $provinceObjects[] = $p;
        }

        foreach ($brandsData as $brandName => $models) {
            $brand = new Brand();
            $brand->setName($brandName);
            $manager->persist($brand);
            foreach ($models as $modelName) {
                $model = new Model();
                $model->setName($modelName);
                $model->setBrand($brand);
                $manager->persist($model);
                $modelObjects[] = $model;
            }
        }

        $fuels = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico'];
        foreach ($fuels as $v) { $o = new Fuel(); $o->setName($v); $manager->persist($o); $fuelObjects[] = $o; }
        
        $transm = ['Manual', 'Automático'];
        foreach ($transm as $v) { $o = new Transmission(); $o->setName($v); $manager->persist($o); $transmissionObjects[] = $o; }

        $cols = ['Blanco', 'Negro', 'Rojo', 'Azul', 'Gris', 'Plata'];
        foreach ($cols as $v) { $o = new Color(); $o->setName($v); $manager->persist($o); $colorObjects[] = $o; }

        $badges = ['B', 'C', 'ECO', '0 Emisiones'];
        foreach ($badges as $v) { $o = new EnviromentalBadge(); $o->setName($v); $manager->persist($o); $badgeObjects[] = $o; }

        $bodies = ['SUV', 'Sedán', 'Compacto', 'Cabrio', 'Familiar'];
        foreach ($bodies as $v) { $o = new BodyType(); $o->setName($v); $manager->persist($o); $bodyTypeObjects[] = $o; }


        // 5. VEHÍCULOS
        $vehicles = [];
        $rentalVehicles = []; 

        for ($i = 0; $i < 60; $i++) {
            $vehicle = new Vehicle();
            $vehicle->setYear($faker->numberBetween(2018, 2024));
            $vehicle->setKilometres($faker->numberBetween(0, 150000));
            $vehicle->setPower($faker->numberBetween(100, 400));
            $vehicle->setDisplacement($faker->randomElement([1500, 2000, 3000]));
            $vehicle->setDoors($faker->randomElement([3, 5]));
            $vehicle->setOwners($faker->numberBetween(1, 3));
            $vehicle->setDescription($faker->paragraph(2));
            
            $vehicle->setStatus($faker->boolean(90) ? 'AVAILABLE' : 'SOLD'); 
            $vehicle->setVisible(true);

            // RELACIONES
            $model = $faker->randomElement($modelObjects);
            $vehicle->setModel($model);
            $vehicle->setBrand($model->getBrand());
            $vehicle->setFuelType($faker->randomElement($fuelObjects));
            $vehicle->setTransmission($faker->randomElement($transmissionObjects));
            $vehicle->setProvince($faker->randomElement($provinceObjects));
            $vehicle->setColor($faker->randomElement($colorObjects));
            $vehicle->setEnviromentalBadge($faker->randomElement($badgeObjects));
            $vehicle->setBodyType($faker->randomElement($bodyTypeObjects));

            $isRent = $faker->boolean(40);

            if ($isRent) {
                $vehicle->setType('RENT');
                $vehicle->setDailyPrice($faker->numberBetween(40, 200)); 
                $vehicle->setPrice(null); 
                if ($vehicle->getStatus() === 'AVAILABLE') {
                    $rentalVehicles[] = $vehicle;
                }
            } else {
                $vehicle->setType('SALE');
                $vehicle->setPrice($faker->numberBetween(12000, 80000)); 
                $vehicle->setDailyPrice(null); 
            }

            $manager->persist($vehicle);
            $vehicles[] = $vehicle;

            // --- GENERACIÓN DE IMÁGENES (CORREGIDO) ---
            $numImages = $faker->numberBetween(1, 3);
            for ($imgI = 0; $imgI < $numImages; $imgI++) {
                $image = new VehicleImage();
                $image->setVehicle($vehicle);
                
                // La primera imagen (índice 0) será la PRINCIPAL (true), las demás no (false)
                $image->setIsMain($imgI === 0); // <--- AQUÍ ESTÁ LA CORRECCIÓN

                $text = urlencode($model->getBrand()->getName() . ' ' . $model->getName() . ' ' . ($imgI + 1));
                $imageUrl = "https://placehold.co/800x600?text={$text}";
                
                $image->setFilename($imageUrl);
                $manager->persist($image);
            }
        }

        // 6. RESERVAS DE PRUEBA
        foreach ($rentalVehicles as $key => $rentCar) {
            if ($key % 3 === 0) {
                $reservation = new Reservation();
                $reservation->setVehicle($rentCar);
                $reservation->setUser($faker->randomElement($users));
                
                $days = $faker->numberBetween(3, 7);
                $startDate = new \DateTime(sprintf('+%d days', $faker->numberBetween(1, 10)));
                $endDate = (clone $startDate)->modify(sprintf('+%d days', $days));

                $reservation->setStartDate($startDate);
                $reservation->setEndDate($endDate);

                $pricePerDay = $rentCar->getDailyPrice();
                $totalPrice = $pricePerDay * $days;
                $reservation->setTotalPrice($totalPrice);

                $reservation->setStatus('CONFIRMED');
                
                $manager->persist($reservation);
            }
        }

        $manager->flush();
    }
}