<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Create a test user
     */
    protected function createTestUser(array $attributes = []): User
    {
        return User::factory()->create($attributes);
    }

    /**
     * Authenticate as a user
     */
    protected function actingAsUser(?User $user = null): self
    {
        $user = $user ?? $this->createTestUser();

        return $this->actingAs($user);
    }

    /**
     * Assert response has validation errors
     */
    protected function assertHasValidationErrors($response, array $fields): void
    {
        $response->assertStatus(422);
        foreach ($fields as $field) {
            $response->assertJsonValidationErrors($field);
        }
    }

    /**
     * Assert paginated response structure
     */
    protected function assertPaginatedResponse($response): void
    {
        $response->assertJsonStructure([
            'data',
            'links',
            'meta' => [
                'current_page',
                'from',
                'last_page',
                'per_page',
                'to',
                'total',
            ],
        ]);
    }
}
