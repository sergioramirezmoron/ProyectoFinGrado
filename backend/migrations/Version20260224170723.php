<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260224170723 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE body_type (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE brand (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, logo VARCHAR(255) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE color (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, hex_code VARCHAR(255) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE conversation (id INT AUTO_INCREMENT NOT NULL, contact_name VARCHAR(255) NOT NULL, contact_email VARCHAR(255) NOT NULL, contact_phone VARCHAR(20) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, status VARCHAR(20) NOT NULL, vehicle_id INT NOT NULL, user_id INT DEFAULT NULL, reservation_id INT DEFAULT NULL, INDEX IDX_8A8E26E9545317D1 (vehicle_id), INDEX IDX_8A8E26E9A76ED395 (user_id), UNIQUE INDEX UNIQ_8A8E26E9B83297E7 (reservation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE enviromental_badge (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, image VARCHAR(255) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE favorite (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, vehicle_id INT NOT NULL, INDEX IDX_68C58ED9A76ED395 (user_id), INDEX IDX_68C58ED9545317D1 (vehicle_id), UNIQUE INDEX UNIQ_FAVORITE_USER_VEHICLE (user_id, vehicle_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE fuel (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE message (id INT AUTO_INCREMENT NOT NULL, content LONGTEXT NOT NULL, created_at DATETIME NOT NULL, is_admin TINYINT(1) NOT NULL, conversation_id INT NOT NULL, INDEX IDX_B6BD307F9AC0396 (conversation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE model (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, brand_id INT NOT NULL, INDEX IDX_D79572D944F5D008 (brand_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE province (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE reservation (id INT AUTO_INCREMENT NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, status VARCHAR(20) NOT NULL, total_price DOUBLE PRECISION NOT NULL, vehicle_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_42C84955545317D1 (vehicle_id), INDEX IDX_42C84955A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE transmission (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE vehicle_image (id INT AUTO_INCREMENT NOT NULL, filename VARCHAR(255) NOT NULL, is_main TINYINT(1) NOT NULL, vehicle_id INT DEFAULT NULL, INDEX IDX_A79284B3545317D1 (vehicle_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E9545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E9A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E9B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id)');
        $this->addSql('ALTER TABLE favorite ADD CONSTRAINT FK_68C58ED9A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE favorite ADD CONSTRAINT FK_68C58ED9545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F9AC0396 FOREIGN KEY (conversation_id) REFERENCES conversation (id)');
        $this->addSql('ALTER TABLE model ADD CONSTRAINT FK_D79572D944F5D008 FOREIGN KEY (brand_id) REFERENCES brand (id)');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C84955545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C84955A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE vehicle_image ADD CONSTRAINT FK_A79284B3545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)');
        $this->addSql('DROP INDEX UNIQ_IDENTIFIER_USERNAME ON user');
        $this->addSql('ALTER TABLE user ADD name VARCHAR(255) NOT NULL, ADD surname VARCHAR(255) DEFAULT NULL, ADD phone VARCHAR(20) DEFAULT NULL, ADD province_id INT DEFAULT NULL, CHANGE username email VARCHAR(180) NOT NULL');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649E946114A FOREIGN KEY (province_id) REFERENCES province (id)');
        $this->addSql('CREATE INDEX IDX_8D93D649E946114A ON user (province_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON user (email)');
        $this->addSql('ALTER TABLE vehicle ADD visible TINYINT(1) NOT NULL, ADD type VARCHAR(10) NOT NULL, ADD daily_price NUMERIC(6, 2) DEFAULT NULL, ADD brand_id INT NOT NULL, ADD model_id INT NOT NULL, ADD fuel_type_id INT NOT NULL, ADD transmission_id INT NOT NULL, ADD body_type_id INT DEFAULT NULL, ADD enviromental_badge_id INT DEFAULT NULL, ADD color_id INT DEFAULT NULL, ADD province_id INT DEFAULT NULL, DROP brand, DROP model, DROP fuel_type, DROP transmission, DROP body_type, DROP enviromental_badge, DROP color, CHANGE price price VARCHAR(255) DEFAULT NULL, CHANGE doors doors INT DEFAULT NULL, CHANGE description description LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E48644F5D008 FOREIGN KEY (brand_id) REFERENCES brand (id)');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E4867975B7E7 FOREIGN KEY (model_id) REFERENCES model (id)');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E4866A70FE35 FOREIGN KEY (fuel_type_id) REFERENCES fuel (id)');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E48678D28519 FOREIGN KEY (transmission_id) REFERENCES transmission (id)');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E4862CBA3505 FOREIGN KEY (body_type_id) REFERENCES body_type (id)');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E48664F6DB96 FOREIGN KEY (enviromental_badge_id) REFERENCES enviromental_badge (id)');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E4867ADA1FB5 FOREIGN KEY (color_id) REFERENCES color (id)');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_1B80E486E946114A FOREIGN KEY (province_id) REFERENCES province (id)');
        $this->addSql('CREATE INDEX IDX_1B80E48644F5D008 ON vehicle (brand_id)');
        $this->addSql('CREATE INDEX IDX_1B80E4867975B7E7 ON vehicle (model_id)');
        $this->addSql('CREATE INDEX IDX_1B80E4866A70FE35 ON vehicle (fuel_type_id)');
        $this->addSql('CREATE INDEX IDX_1B80E48678D28519 ON vehicle (transmission_id)');
        $this->addSql('CREATE INDEX IDX_1B80E4862CBA3505 ON vehicle (body_type_id)');
        $this->addSql('CREATE INDEX IDX_1B80E48664F6DB96 ON vehicle (enviromental_badge_id)');
        $this->addSql('CREATE INDEX IDX_1B80E4867ADA1FB5 ON vehicle (color_id)');
        $this->addSql('CREATE INDEX IDX_1B80E486E946114A ON vehicle (province_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E9545317D1');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E9A76ED395');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E9B83297E7');
        $this->addSql('ALTER TABLE favorite DROP FOREIGN KEY FK_68C58ED9A76ED395');
        $this->addSql('ALTER TABLE favorite DROP FOREIGN KEY FK_68C58ED9545317D1');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F9AC0396');
        $this->addSql('ALTER TABLE model DROP FOREIGN KEY FK_D79572D944F5D008');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955545317D1');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C84955A76ED395');
        $this->addSql('ALTER TABLE vehicle_image DROP FOREIGN KEY FK_A79284B3545317D1');
        $this->addSql('DROP TABLE body_type');
        $this->addSql('DROP TABLE brand');
        $this->addSql('DROP TABLE color');
        $this->addSql('DROP TABLE conversation');
        $this->addSql('DROP TABLE enviromental_badge');
        $this->addSql('DROP TABLE favorite');
        $this->addSql('DROP TABLE fuel');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE model');
        $this->addSql('DROP TABLE province');
        $this->addSql('DROP TABLE reservation');
        $this->addSql('DROP TABLE transmission');
        $this->addSql('DROP TABLE vehicle_image');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D649E946114A');
        $this->addSql('DROP INDEX IDX_8D93D649E946114A ON `user`');
        $this->addSql('DROP INDEX UNIQ_IDENTIFIER_EMAIL ON `user`');
        $this->addSql('ALTER TABLE `user` DROP name, DROP surname, DROP phone, DROP province_id, CHANGE email username VARCHAR(180) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_USERNAME ON `user` (username)');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E48644F5D008');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E4867975B7E7');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E4866A70FE35');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E48678D28519');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E4862CBA3505');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E48664F6DB96');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E4867ADA1FB5');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_1B80E486E946114A');
        $this->addSql('DROP INDEX IDX_1B80E48644F5D008 ON vehicle');
        $this->addSql('DROP INDEX IDX_1B80E4867975B7E7 ON vehicle');
        $this->addSql('DROP INDEX IDX_1B80E4866A70FE35 ON vehicle');
        $this->addSql('DROP INDEX IDX_1B80E48678D28519 ON vehicle');
        $this->addSql('DROP INDEX IDX_1B80E4862CBA3505 ON vehicle');
        $this->addSql('DROP INDEX IDX_1B80E48664F6DB96 ON vehicle');
        $this->addSql('DROP INDEX IDX_1B80E4867ADA1FB5 ON vehicle');
        $this->addSql('DROP INDEX IDX_1B80E486E946114A ON vehicle');
        $this->addSql('ALTER TABLE vehicle ADD brand VARCHAR(255) NOT NULL, ADD model VARCHAR(255) NOT NULL, ADD fuel_type VARCHAR(255) NOT NULL, ADD transmission VARCHAR(255) NOT NULL, ADD body_type VARCHAR(255) NOT NULL, ADD enviromental_badge VARCHAR(255) NOT NULL, ADD color VARCHAR(255) DEFAULT NULL, DROP visible, DROP type, DROP daily_price, DROP brand_id, DROP model_id, DROP fuel_type_id, DROP transmission_id, DROP body_type_id, DROP enviromental_badge_id, DROP color_id, DROP province_id, CHANGE price price DOUBLE PRECISION NOT NULL, CHANGE doors doors INT NOT NULL, CHANGE description description LONGTEXT NOT NULL');
    }
}
