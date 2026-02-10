<?php

namespace App\Http\Controllers\Task;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class TaskHistoryController extends Controller
{
    /**
     * Get task audit history
     */
    public function index(Project $project, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $audits = $task->audits()
            ->with('user:id,name,email')
            ->latest('id')
            ->paginate(50);

        return response()->json(
            $audits->map(fn ($audit) => $this->formatAudit($audit))
        );
    }

    /**
     * Get task activity timeline
     */
    public function timeline(Project $project, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        // Combine audits and activities
        $audits = $task->audits()
            ->with('user:id,name,email,profile_photo_path')
            ->latest('created_at')
            ->get()
            ->map(fn ($audit) => $this->formatAuditForTimeline($audit));

        $comments = $task->comments()
            ->with('user:id,name,email,profile_photo_path')
            ->latest('created_at')
            ->get()
            ->map(fn ($comment) => [
                'type' => 'comment',
                'event' => 'Comment added',
                'timestamp' => $comment->created_at,
                'user' => $comment->user,
                'description' => $comment->content,
                'icon' => 'message',
                'color' => 'blue',
            ]);

        $timeLogs = $task->timeLogs()
            ->with('user:id,name,email,profile_photo_path')
            ->latest('created_at')
            ->get()
            ->map(fn ($log) => [
                'type' => 'time_log',
                'event' => 'Time logged',
                'timestamp' => $log->created_at,
                'user' => $log->user,
                'description' => $log->minutes.' minutes',
                'icon' => 'clock',
                'color' => 'green',
            ]);

        // Merge and sort by timestamp
        $timeline = collect()
            ->merge($audits)
            ->merge($comments)
            ->merge($timeLogs)
            ->sortByDesc('timestamp')
            ->values();

        return response()->json($timeline);
    }

    /**
     * Format audit for display
     */
    private function formatAudit($audit): array
    {
        $changes = [];

        foreach ($audit->getModified() as $field => $change) {
            $changes[] = [
                'field' => $this->formatFieldName($field),
                'old' => $this->formatValue($field, $change['old']),
                'new' => $this->formatValue($field, $change['new']),
            ];
        }

        return [
            'id' => $audit->id,
            'event' => ucfirst($audit->event),
            'user' => $audit->user ? [
                'id' => $audit->user->id,
                'name' => $audit->user->name,
            ] : null,
            'changes' => $changes,
            'created_at' => $audit->created_at,
            'ip' => $audit->ip_address,
        ];
    }

    /**
     * Format audit for timeline
     */
    private function formatAuditForTimeline($audit): array
    {
        $modified = $audit->getModified();

        if (empty($modified)) {
            return [
                'type' => 'audit',
                'event' => 'Task '.$audit->event,
                'timestamp' => $audit->created_at,
                'user' => $audit->user,
                'description' => 'Task was '.$audit->event,
                'icon' => $audit->event === 'created' ? 'plus' : 'pencil',
                'color' => $audit->event === 'created' ? 'green' : 'blue',
            ];
        }

        $descriptions = array_map(function ($field, $change) {
            return $this->formatFieldName($field).' changed from "'.
                   $this->formatValue($field, $change['old']).'" to "'.
                   $this->formatValue($field, $change['new']).'"';
        }, array_keys($modified), array_values($modified));

        return [
            'type' => 'audit',
            'event' => 'Task updated',
            'timestamp' => $audit->created_at,
            'user' => $audit->user,
            'description' => implode(', ', $descriptions),
            'changes' => count($modified),
            'icon' => 'pencil',
            'color' => 'yellow',
        ];
    }

    /**
     * Format field name for display
     */
    private function formatFieldName(string $field): string
    {
        $mapping = [
            'name' => 'Name',
            'description' => 'Description',
            'due_on' => 'Due date',
            'estimation' => 'Estimation',
            'assigned_to_user_id' => 'Assigned to',
            'priority_id' => 'Priority',
            'completed_at' => 'Status',
            'billable' => 'Billable',
            'fixed_price' => 'Fixed price',
            'pricing_type' => 'Pricing type',
        ];

        return $mapping[$field] ?? str()->headline($field)->toString();
    }

    /**
     * Format value for display
     */
    private function formatValue(string $field, mixed $value): string
    {
        if ($value === null) {
            return 'None';
        }

        if ($field === 'completed_at') {
            return $value ? 'Completed' : 'Pending';
        }

        if ($field === 'billable') {
            return $value ? 'Yes' : 'No';
        }

        if (is_array($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }
}
