<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Project $project;

    private TaskGroup $taskGroup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create();
        $this->project->users()->attach($this->user);
        $this->taskGroup = TaskGroup::factory()->create(['project_id' => $this->project->id]);
    }

    /** @test */
    public function can_create_task()
    {
        $data = [
            'name' => 'Test Task',
            'description' => 'Task description',
            'group_id' => $this->taskGroup->id,
            'assigned_to_user_id' => $this->user->id,
            'due_on' => now()->addDays(5)->toDateString(),
        ];

        $this->actingAs($this->user)
            ->postJson(route('projects.tasks.store', $this->project), $data)
            ->assertStatus(201)
            ->assertJsonFragment(['name' => 'Test Task']);

        $this->assertDatabaseHas('tasks', ['name' => 'Test Task']);
    }

    /** @test */
    public function can_update_task()
    {
        $task = Task::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->user)
            ->putJson(route('projects.tasks.update', [$this->project, $task]), [
                'name' => 'Updated Task Name',
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'name' => 'Updated Task Name',
        ]);
    }

    /** @test */
    public function can_complete_task()
    {
        $task = Task::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->user)
            ->postJson(route('projects.tasks.complete', [$this->project, $task]), [
                'completed' => true,
            ])
            ->assertStatus(200);

        $this->assertNotNull($task->refresh()->completed_at);
    }

    /** @test */
    public function can_log_time_on_task()
    {
        $task = Task::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->user)
            ->postJson(route('projects.tasks.time-logs.store', [$this->project, $task]), [
                'minutes' => 60,
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('time_logs', [
            'task_id' => $task->id,
            'user_id' => $this->user->id,
            'minutes' => 60,
        ]);
    }

    /** @test */
    public function can_add_label_to_task()
    {
        $task = Task::factory()->create(['project_id' => $this->project->id]);
        $label = $this->project->labels()->create(['name' => 'Bug']);

        $this->actingAs($this->user)
            ->postJson(route('projects.tasks.update', [$this->project, $task]), [
                'labels' => [$label->id],
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('label_task', [
            'task_id' => $task->id,
            'label_id' => $label->id,
        ]);
    }

    /** @test */
    public function can_view_task_history()
    {
        $task = Task::factory()->create(['project_id' => $this->project->id]);

        // Make a change
        $task->update(['name' => 'Updated Name']);

        $this->actingAs($this->user)
            ->getJson(route('projects.tasks.history', [$this->project, $task]))
            ->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['event', 'user', 'created_at'],
            ]);
    }

    /** @test */
    public function cannot_delete_task_without_permission()
    {
        $task = Task::factory()->create(['project_id' => $this->project->id]);
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser)
            ->deleteJson(route('projects.tasks.destroy', [$this->project, $task]))
            ->assertStatus(403);
    }

    /** @test */
    public function task_can_have_multiple_time_loggers()
    {
        $task = Task::factory()->create(['project_id' => $this->project->id]);
        $user2 = User::factory()->create();
        $this->project->users()->attach($user2);

        // User 1 logs time
        $this->actingAs($this->user)
            ->postJson(route('projects.tasks.time-logs.store', [$this->project, $task]), [
                'minutes' => 60,
            ])
            ->assertStatus(200);

        // User 2 logs time
        $this->actingAs($user2)
            ->postJson(route('projects.tasks.time-logs.store', [$this->project, $task]), [
                'minutes' => 120,
            ])
            ->assertStatus(200);

        $timeLogs = $task->timeLogs()->get();
        $this->assertCount(2, $timeLogs);
        $this->assertEquals(60 + 120, $timeLogs->sum('minutes'));
    }
}
