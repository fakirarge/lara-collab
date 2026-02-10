<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PerformanceOptimizationService
{
    const CACHE_TTL = 3600; // 1 hour

    /**
     * Get projects with optimized queries (eager loading)
     */
    public function getProjectsOptimized(User $user): Collection
    {
        return Cache::remember("user.{$user->id}.projects", self::CACHE_TTL, function () {
            return Project::with([
                'clientCompany:id,name',
                'users:id,name,email',
                'taskGroups:id,project_id,name',
            ])
                ->whereHas('users', fn ($q) => $q->where('user_id', auth()->id()))
                ->select(['id', 'name', 'description', 'client_company_id', 'created_at', 'updated_at'])
                ->get();
        });
    }

    /**
     * Get user dashboard data (optimized)
     */
    public function getDashboardDataOptimized(User $user): array
    {
        return Cache::remember("user.{$user->id}.dashboard", self::CACHE_TTL, function () use ($user) {
            return [
                'assigned_tasks' => Task::where('assigned_to_user_id', $user->id)
                    ->whereNull('completed_at')
                    ->with('project:id,name', 'assignedToUser:id,name')
                    ->select(['id', 'name', 'project_id', 'assigned_to_user_id', 'due_on'])
                    ->limit(10)
                    ->get(),

                'overdue_tasks' => Task::where('assigned_to_user_id', $user->id)
                    ->whereNull('completed_at')
                    ->where('due_on', '<', now())
                    ->count(),

                'recent_activity' => DB::table('activities')
                    ->where('user_id', $user->id)
                    ->orWhereHas('activityCapable', fn ($q) => $q->whereIn('project_id', $user->projects()->pluck('id'))
                    )
                    ->latest('id')
                    ->limit(20)
                    ->get(),

                'total_time_logged' => Task::with('timeLogs')
                    ->whereHas('timeLogs', fn ($q) => $q->where('user_id', $user->id))
                    ->get()
                    ->sum(fn ($task) => $task->timeLogs->sum('minutes')),
            ];
        });
    }

    /**
     * Get project statistics (optimized)
     */
    public function getProjectStatsOptimized(Project $project): array
    {
        return Cache::remember("project.{$project->id}.stats", self::CACHE_TTL, function () use ($project) {
            return [
                'total_tasks' => $project->tasks()->count(),
                'completed_tasks' => $project->tasks()->whereNotNull('completed_at')->count(),
                'overdue_tasks' => $project->tasks()
                    ->whereNull('completed_at')
                    ->where('due_on', '<', now())
                    ->count(),
                'total_time_logged' => DB::table('time_logs')
                    ->whereIn('task_id', $project->tasks()->pluck('id'))
                    ->sum('minutes'),
                'users_count' => $project->users()->count(),
                'completion_percentage' => $this->getCompletionPercentage($project),
            ];
        });
    }

    /**
     * Get tasks with optimized queries
     */
    public function getTasksOptimized(Project $project): Collection
    {
        return Task::where('project_id', $project->id)
            ->with([
                'assignedToUser:id,name,email',
                'priority:id,label,color',
                'labels:id,name,color',
            ])
            ->select([
                'id', 'name', 'project_id', 'group_id',
                'assigned_to_user_id', 'priority_id', 'due_on', 'completed_at',
            ])
            ->get();
    }

    /**
     * Get time logs summary (optimized)
     */
    public function getTimeLogsSummary(User $user, ?int $projectId = null): array
    {
        $query = DB::table('time_logs')
            ->where('user_id', $user->id)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(minutes) as total_minutes')
            )
            ->groupBy(DB::raw('DATE(created_at)'));

        if ($projectId) {
            $query->whereIn('task_id',
                Task::where('project_id', $projectId)->pluck('id')
            );
        }

        return $query->orderByDesc('date')
            ->limit(30)
            ->get()
            ->toArray();
    }

    /**
     * Clean expired role assignments
     */
    public function cleanupExpiredRoles(): int
    {
        return DB::table('user_roles')
            ->where('expires_at', '<', now())
            ->delete();
    }

    /**
     * Batch process large datasets
     */
    public function batchProcessTasks(callable $callback, int $batchSize = 100): void
    {
        Task::query()
            ->chunkById($batchSize, function ($tasks) use ($callback) {
                foreach ($tasks as $task) {
                    $callback($task);
                }
            });
    }

    /**
     * Get completion percentage
     */
    private function getCompletionPercentage(Project $project): float
    {
        $total = $project->tasks()->count();
        if ($total === 0) {
            return 0;
        }

        $completed = $project->tasks()->whereNotNull('completed_at')->count();

        return round(($completed / $total) * 100, 2);
    }

    /**
     * Clear all user-related caches
     */
    public function clearUserCache(User $user): void
    {
        Cache::forget("user.{$user->id}.tasks");
        Cache::forget("user.{$user->id}.summary");
        Cache::forget("user.{$user->id}.permissions");
    }

    /**
     * Clear all project-related caches
     */
    public function clearProjectCache(Project $project): void
    {
        Cache::forget("project.{$project->id}.stats");
        Cache::forget("project.{$project->id}.tasks");
        Cache::forget("project.{$project->id}.summary");
        Cache::forget("project.{$project->id}.members");
    }
}
