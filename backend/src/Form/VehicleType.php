<?php

namespace App\Form;

use App\Entity\BodyType;
use App\Entity\Brand;
use App\Entity\Color;
use App\Entity\EnviromentalBadge;
use App\Entity\Fuel;
use App\Entity\Model;
use App\Entity\Transmission;
use App\Entity\Vehicle;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class VehicleType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('brand', EntityType::class, [
                'class' => Brand::class,
                'choice_label' => 'name',
            ])
            ->add('model', EntityType::class, [
                'class' => Model::class,
                'choice_label' => 'name',
            ])
            ->add('price')
            ->add('year')
            ->add('kilometres')
            ->add('power')
            ->add('displacement')
            ->add('fuelType', EntityType::class, [
                'class' => Fuel::class,
                'choice_label' => 'name',
            ])
            ->add('transmission', EntityType::class, [
                'class' => Transmission::class,
                'choice_label' => 'name',
            ])
            ->add('bodyType', EntityType::class, [
                'class' => BodyType::class,
                'choice_label' => 'name',
            ])
            ->add('enviromentalBadge', EntityType::class, [
                'class' => EnviromentalBadge::class,
                'choice_label' => 'name',
            ])
            ->add('color', EntityType::class, [
                'class' => Color::class,
                'choice_label' => 'name',
            ])
            ->add('doors')
            ->add('owners')
            ->add('description')
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Vehicle::class,
            'csrf_protection' => false,
        ]);
    }
}
