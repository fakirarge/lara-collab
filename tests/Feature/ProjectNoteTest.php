<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectNote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectNoteTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create();
        $this->project->users()->attach($this->user);
    }

    /** @test */
    public function can_list_project_notes()
    {
        ProjectNote::factory(3)->create([
            'project_id' => $this->project->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(route('api.projects.notes.index', $this->project));

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonStructure([
                '*' => ['id', 'title', 'content', 'pinned', 'created_at', 'updated_at'],
            ]);
    }

    /** @test */
    public function can_create_project_note()
    {
        $data = [
            'title' => 'Important Note',
            'content' => '<p>This is an important note</p>',
            'pinned' => true,
        ];

        $response = $this->actingAs($this->user)
            ->postJson(route('api.projects.notes.store', $this->project), $data);

        $response->assertStatus(201)
            ->assertJsonFragment($data);

        $this->assertDatabaseHas('project_notes', [
            'title' => 'Important Note',
            'created_by' => $this->user->id,
        ]);
    }

    /** @test */
    public function cannot_create_note_without_title()
    {
        $data = [
            'title' => '',
            'content' => '<p>Content</p>',
        ];

        $response = $this->actingAs($this->user)
            ->postJson(route('api.projects.notes.store', $this->project), $data);

        $response->assertStatus(422);
    }

    /** @test */
    public function can_update_own_note()
    {
        $note = ProjectNote::factory()->create([
            'project_id' => $this->project->id,
            'created_by' => $this->user->id,
        ]);

        $data = [
            'title' => 'Updated Title',
            'content' => '<p>Updated content</p>',
        ];

        $response = $this->actingAs($this->user)
            ->putJson(route('api.projects.notes.update', [$this->project, $note]), $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('project_notes', [
            'id' => $note->id,
            'title' => 'Updated Title',
            'updated_by' => $this->user->id,
        ]);
    }

    /** @test */
    public function can_toggle_pin_status()
    {
        $note = ProjectNote::factory()->create([
            'project_id' => $this->project->id,
            'created_by' => $this->user->id,
            'pinned' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson(route('api.projects.notes.update', [$this->project, $note]), [
                'pinned' => true,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('project_notes', [
            'id' => $note->id,
            'pinned' => true,
        ]);
    }

    /** @test */
    public function can_delete_own_note()
    {
        $note = ProjectNote::factory()->create([
            'project_id' => $this->project->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson(route('api.projects.notes.destroy', [$this->project, $note]));

        $response->assertStatus(204);

        $this->assertDatabaseMissing('project_notes', [
            'id' => $note->id,
        ]);
    }

    /** @test */
    public function user_cannot_edit_other_users_note_without_permission()
    {
        $otherUser = User::factory()->create();
        $this->project->users()->attach($otherUser);

        $note = ProjectNote::factory()->create([
            'project_id' => $this->project->id,
            'created_by' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson(route('api.projects.notes.update', [$this->project, $note]), [
                'title' => 'Hacked',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function notes_are_sorted_by_pinned_first()
    {
        $unpinned = ProjectNote::factory()->create([
            'project_id' => $this->project->id,
            'created_by' => $this->user->id,
            'pinned' => false,
        ]);

        $pinned = ProjectNote::factory()->create([
            'project_id' => $this->project->id,
            'created_by' => $this->user->id,
            'pinned' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(route('api.projects.notes.index', $this->project));

        $notes = $response->json();
        $this->assertTrue($notes[0]['pinned']);
        $this->assertFalse($notes[1]['pinned']);
    }

    /** @test */
    public function cascade_delete_removes_notes_with_project()
    {
        ProjectNote::factory(2)->create([
            'project_id' => $this->project->id,
            'created_by' => $this->user->id,
        ]);

        $this->project->delete();

        $this->assertDatabaseCount('project_notes', 0);
    }

    /** @test */
    public function can_view_note_creator_info()
    {
        $note = ProjectNote::factory()->create([
            'project_id' => $this->project->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson(route('api.projects.notes.index', $this->project));

        $response->assertJsonFragment([
            'creator' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
        ]);
    }
}

