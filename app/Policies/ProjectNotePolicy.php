<?php

namespace App\Policies;

use App\Models\ProjectNote;
use App\Models\User;

class ProjectNotePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProjectNote $projectNote): bool
    {
        return $user->hasAccessToProject($projectNote->project_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProjectNote $projectNote): bool
    {
        return $user->id === $projectNote->created_by || $user->hasPermissionTo('edit project note');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProjectNote $projectNote): bool
    {
        return $user->id === $projectNote->created_by || $user->hasPermissionTo('delete project note');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ProjectNote $projectNote): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ProjectNote $projectNote): bool
    {
        return false;
    }
}
