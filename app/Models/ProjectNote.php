<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectNote extends Model
{
    protected $fillable = [
        'project_id',
        'created_by',
        'updated_by',
        'title',
        'content',
        'pinned',
        'order',
    ];

    protected $casts = [
        'pinned' => 'boolean',
    ];

    /**
     * Get the project that owns the note.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who created the note.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the note.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
