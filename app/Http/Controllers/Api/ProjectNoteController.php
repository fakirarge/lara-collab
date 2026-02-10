<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectNote;
use Illuminate\Http\Request;

class ProjectNoteController extends Controller
{
    /**
     * Display a listing of project notes.
     */
    public function index(Project $project)
    {
        $this->authorize('view', $project);

        $notes = $project->notes()
            ->with(['creator:id,name,email', 'updater:id,name,email'])
            ->orderBy('pinned', 'desc')
            ->orderBy('order')
            ->get();

        return response()->json($notes);
    }

    /**
     * Store a newly created note.
     */
    public function store(Request $request, Project $project)
    {
        $this->authorize('create', ProjectNote::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'pinned' => 'boolean',
        ]);

        $note = $project->notes()->create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'pinned' => $validated['pinned'] ?? false,
            'created_by' => auth()->id(),
        ]);

        return response()->json($note->load(['creator:id,name,email', 'updater:id,name,email']), 201);
    }

    /**
     * Display the specified note.
     */
    public function show(Project $project, ProjectNote $note)
    {
        $this->authorize('view', $note);

        return response()->json($note->load(['creator:id,name,email', 'updater:id,name,email']));
    }

    /**
     * Update the specified note.
     */
    public function update(Request $request, Project $project, ProjectNote $note)
    {
        $this->authorize('update', $note);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'string',
            'pinned' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        $note->update([
            ...$validated,
            'updated_by' => auth()->id(),
        ]);

        return response()->json($note->load(['creator:id,name,email', 'updater:id,name,email']));
    }

    /**
     * Remove the specified note.
     */
    public function destroy(Project $project, ProjectNote $note)
    {
        $this->authorize('delete', $note);

        $note->delete();

        return response()->json(null, 204);
    }
}
