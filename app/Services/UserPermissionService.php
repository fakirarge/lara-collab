<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UserPermissionService
{
    /**
     * Grant a specific permission to a user (override)
     */
    public function grantPermissionToUser(User $user, Permission $permission, ?User $grantedBy = null, ?string $reason = null): void
    {
        DB::table('user_permissions')->updateOrInsert(
            ['user_id' => $user->id, 'permission_id' => $permission->id],
            [
                'allowed' => true,
                'granted_by' => $grantedBy?->id ?? auth()->id(),
                'reason' => $reason,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    /**
     * Revoke a specific permission from a user (deny)
     */
    public function denyPermissionFromUser(User $user, Permission $permission, ?User $deniedBy = null, ?string $reason = null): void
    {
        DB::table('user_permissions')->updateOrInsert(
            ['user_id' => $user->id, 'permission_id' => $permission->id],
            [
                'allowed' => false,
                'granted_by' => $deniedBy?->id ?? auth()->id(),
                'reason' => $reason,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    /**
     * Remove user-specific permission override
     */
    public function removeUserPermissionOverride(User $user, Permission $permission): void
    {
        DB::table('user_permissions')
            ->where('user_id', $user->id)
            ->where('permission_id', $permission->id)
            ->delete();
    }

    /**
     * Assign role to user (optionally scoped to project)
     */
    public function assignRoleToUser(User $user, Role $role, ?User $grantedBy = null, ?int $projectId = null, ?string $reason = null, ?\DateTime $expiresAt = null): void
    {
        DB::table('user_roles')->updateOrInsert(
            [
                'user_id' => $user->id,
                'role_id' => $role->id,
                'project_id' => $projectId,
            ],
            [
                'granted_by' => $grantedBy?->id ?? auth()->id(),
                'reason' => $reason,
                'expires_at' => $expiresAt,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        // Clear user's permission cache
        $this->clearUserPermissionCache($user);
    }

    /**
     * Remove role from user
     */
    public function removeRoleFromUser(User $user, Role $role, ?int $projectId = null): void
    {
        DB::table('user_roles')
            ->where('user_id', $user->id)
            ->where('role_id', $role->id)
            ->where('project_id', $projectId)
            ->delete();

        $this->clearUserPermissionCache($user);
    }

    /**
     * Check if user has permission (considering overrides)
     */
    public function userHasPermission(User $user, string $permissionName): bool
    {
        $permission = Permission::where('name', $permissionName)->first();

        if (! $permission) {
            return false;
        }

        // Check user-specific override first
        $override = DB::table('user_permissions')
            ->where('user_id', $user->id)
            ->where('permission_id', $permission->id)
            ->first();

        if ($override) {
            return (bool) $override->allowed;
        }

        // Fall back to role-based permissions
        return $user->hasPermissionTo($permissionName);
    }

    /**
     * Get all user-specific permission overrides
     */
    public function getUserPermissionOverrides(User $user): Collection
    {
        return DB::table('user_permissions')
            ->where('user_id', $user->id)
            ->with('permission')
            ->get();
    }

    /**
     * Get all user-specific roles
     */
    public function getUserRoles(User $user, ?int $projectId = null): Collection
    {
        $query = DB::table('user_roles')
            ->where('user_id', $user->id);

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        return $query->with('role')->get();
    }

    /**
     * Check if user role assignment has expired
     */
    public function hasExpiredRoles(User $user): bool
    {
        return DB::table('user_roles')
            ->where('user_id', $user->id)
            ->where('expires_at', '<', now())
            ->exists();
    }

    /**
     * Clean up expired role assignments
     */
    public function cleanupExpiredRoles(): void
    {
        DB::table('user_roles')
            ->where('expires_at', '<', now())
            ->delete();
    }

    /**
     * Get permission audit trail for user
     */
    public function getPermissionAuditTrail(User $user): array
    {
        $grants = DB::table('user_permissions')
            ->join('permissions', 'user_permissions.permission_id', '=', 'permissions.id')
            ->leftJoin('users as granted_users', 'user_permissions.granted_by', '=', 'granted_users.id')
            ->where('user_permissions.user_id', $user->id)
            ->select(
                'user_permissions.id',
                'permissions.name as permission_name',
                'user_permissions.allowed',
                'granted_users.name as granted_by_name',
                'user_permissions.reason',
                'user_permissions.updated_at'
            )
            ->orderByDesc('user_permissions.updated_at')
            ->get();

        $roles = DB::table('user_roles')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->leftJoin('users as granted_users', 'user_roles.granted_by', '=', 'granted_users.id')
            ->where('user_roles.user_id', $user->id)
            ->select(
                'user_roles.id',
                'roles.name as role_name',
                'granted_users.name as granted_by_name',
                'user_roles.reason',
                'user_roles.expires_at',
                'user_roles.updated_at'
            )
            ->orderByDesc('user_roles.updated_at')
            ->get();

        return [
            'permissions' => $grants,
            'roles' => $roles,
        ];
    }

    /**
     * Clear user permission cache
     */
    private function clearUserPermissionCache(User $user): void
    {
        cache()->forget("user.{$user->id}.permissions");
        cache()->forget("user.{$user->id}.roles");
    }
}
