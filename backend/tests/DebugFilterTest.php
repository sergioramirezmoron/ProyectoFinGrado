<?php
namespace App\Tests;
use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
class DebugFilterTest extends ApiTestCase
{
    public function testDump(): void
    {
        $client = static::createClient();
        $response = $client->request('GET', '/api/vehicles?type=SALE');
        $data = $response->toArray(false);
        echo "\nTotal: " . ($data['totalItems'] ?? 'N/A') . "\n";
        echo "Search template vars:\n";
        foreach (($data['search']['mapping'] ?? $data['search']['hydra:mapping'] ?? []) as $m) {
            echo "  variable=" . ($m['variable'] ?? $m['@id'] ?? '?') . " property=" . ($m['property'] ?? '?') . "\n";
        }
        $this->assertTrue(true);
    }
}
