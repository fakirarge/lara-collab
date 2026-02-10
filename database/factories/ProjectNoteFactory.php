<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectNote>
 */
class ProjectNoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => null,
            'created_by' => null,
            'updated_by' => null,
            'title' => $this->faker->sentence(),
            'content' => '<p>'.$this->faker->paragraph().'</p>',
            'pinned' => $this->faker->boolean(20),
            'order' => 0,
        ];
    }
}
