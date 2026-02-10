<?php

namespace Database\Seeders;

use App\Models\TaskPriority;
use Illuminate\Database\Seeder;

class TaskPrioritySeeder extends Seeder
{
    /**
     * Seed default task priorities
     */
    public function run(): void
    {
        $priorities = [
            ['label' => 'Low', 'color' => '#10b981', 'order' => 1],
            ['label' => 'Medium', 'color' => '#f59e0b', 'order' => 2],
            ['label' => 'High', 'color' => '#ef4444', 'order' => 3],
            ['label' => 'Urgent', 'color' => '#dc2626', 'order' => 4],
        ];

        foreach ($priorities as $priority) {
            TaskPriority::firstOrCreate(
                ['label' => $priority['label']],
                $priority
            );
        }

        $this->command->info('✅ Task priorities seeded successfully!');
    }
}

