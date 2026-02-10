<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\UserPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserPermissionController extends Controller
{
    public function __construct(private UserPermissionService $permissionService) {}

    /**
     * Get all permission overrides for a user
     */
    public function getOverrides(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        $overrides = $this->permissionService->getUserPermissionOverrides($user);

        return response()->json([
            'permissions' => $overrides,
            'roles' => $this->permissionService->getUserRoles($user),
            'audit_trail' => $this->permissionService->getPermissionAuditTrail($user),
        ]);
    }

    /**
     * Grant permission to user
     */
    public function grantPermission(Request $request, User $user, Permission $permission): JsonResponse
    {
        $this->authorize('manage', $user);

        $this->permissionService->grantPermissionToUser(
            $user,
            $permission,
            auth()->user(),
            $request->input('reason')
        );

        return response()->json([
            'message' => "Permission '{$permission->name}' granted to {$user->name}",
            'user' => $user->load('permissions', 'roles'),
        ]);
    }

    /**
     * Deny permission from user
     */
    public function denyPermission(Request $request, User $user, Permission $permission): JsonResponse
    {
        $this->authorize('manage', $user);

        $this->permissionService->denyPermissionFromUser(
            $user,
            $permission,
            auth()->user(),
            $request->input('reason')
        );

        return response()->json([
            'message' => "Permission '{$permission->name}' denied for {$user->name}",
            'user' => $user->load('permissions', 'roles'),
        ]);
    }

    /**
     * Remove permission override
     */
    public function removeOverride(User $user, Permission $permission): JsonResponse
    {
        $this->authorize('manage', $user);

        $this->permissionService->removeUserPermissionOverride($user, $permission);

        return response()->json([
            'message' => "Permission override removed for {$user->name}",
        ]);
    }

    /**
     * Assign role to user
     */
    public function assignRole(Request $request, User $user, Role $role): JsonResponse
    {
        $this->authorize('manage', $user);

        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'reason' => 'nullable|string|max:255',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $this->permissionService->assignRoleToUser(
            $user,
            $role,
            auth()->user(),
            $validated['project_id'] ?? null,
            $validated['reason'] ?? null,
            $validated['expires_at'] ? new \DateTime($validated['expires_at']) : null
        );

        return response()->json([
            'message' => "Role '{$role->name}' assigned to {$user->name}",
            'user' => $user->load('permissions', 'roles'),
        ]);
    }

    /**
     * Remove role from user
     */
    public function removeRole(User $user, Role $role, ?int $projectId = null): JsonResponse
    {
        $this->authorize('manage', $user);

        $this->permissionService->removeRoleFromUser($user, $role, $projectId);

        return response()->json([
            'message' => "Role '{$role->name}' removed from {$user->name}",
        ]);
    }

    /**
     * Get all users with specific permission
     */
    public function usersWithPermission(Permission $permission): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::whereHas('permissions', function ($query) use ($permission) {
            $query->where('permission_id', $permission->id);
        })->get(['id', 'name', 'email']);

        return response()->json([
            'permission' => $permission->name,
            'users' => $users,
        ]);
    }

    /**
     * Get all users with specific role
     */
    public function usersWithRole(Role $role): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::whereHas('roles', function ($query) use ($role) {
            $query->where('role_id', $role->id);
        })->get(['id', 'name', 'email']);

        return response()->json([
            'role' => $role->name,
            'users' => $users,
        ]);
    }

    /**
     * Bulk update permissions for multiple users
     */
    public function bulkUpdatePermissions(Request $request): JsonResponse
    {
        $this->authorize('manage', User::class);

        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'permission_ids' => 'required|array|min:1',
            'action' => 'required|in:grant,deny,remove',
            'reason' => 'nullable|string|max:255',
        ]);

        $users = User::whereIn('id', $validated['user_ids'])->get();
        $permissions = Permission::whereIn('id', $validated['permission_ids'])->get();

        foreach ($users as $user) {
            foreach ($permissions as $permission) {
                match ($validated['action']) {
                    'grant' => $this->permissionService->grantPermissionToUser(
                        $user,
                        $permission,
                        auth()->user(),
                        $validated['reason']
                    ),
                    'deny' => $this->permissionService->denyPermissionFromUser(
                        $user,
                        $permission,
                        auth()->user(),
                        $validated['reason']
                    ),
                    'remove' => $this->permissionService->removeUserPermissionOverride($user, $permission),
                };
            }
        }

        return response()->json([
            'message' => "Permissions updated for {$users->count()} users",
        ]);
    }
}
