<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Permission;
use App\Models\Role;
use App\Services\UserPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPermissionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $targetUser;
    private Permission $permission;
    private Role $role;
    private UserPermissionService $permissionService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $this->targetUser = User::factory()->create();

        $this->permission = Permission::firstOrCreate(
            ['name' => 'test.permission'],
            ['guard_name' => 'web']
        );

        $this->role = Role::firstOrCreate(
            ['name' => 'test.role'],
            ['guard_name' => 'web']
        );

        $this->permissionService = app(UserPermissionService::class);

        // Make admin admin
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['guard_name' => 'web']);
        $this->admin->assignRole($adminRole);
    }

    /** @test */
    public function can_grant_permission_to_user()
    {
        $this->permissionService->grantPermissionToUser(
            $this->targetUser,
            $this->permission,
            $this->admin
        );

        $this->assertTrue(
            $this->permissionService->userHasPermission(
                $this->targetUser,
                'test.permission'
            )
        );
    }

    /** @test */
    public function can_deny_permission_from_user()
    {
        // First grant
        $this->permissionService->grantPermissionToUser(
            $this->targetUser,
            $this->permission,
            $this->admin
        );

        // Then deny
        $this->permissionService->denyPermissionFromUser(
            $this->targetUser,
            $this->permission,
            $this->admin,
            'Testing'
        );

        $this->assertFalse(
            $this->permissionService->userHasPermission(
                $this->targetUser,
                'test.permission'
            )
        );
    }

    /** @test */
    public function can_remove_permission_override()
    {
        $this->permissionService->grantPermissionToUser(
            $this->targetUser,
            $this->permission,
            $this->admin
        );

        $this->permissionService->removeUserPermissionOverride(
            $this->targetUser,
            $this->permission
        );

        // Should fall back to role-based permission
        $this->assertFalse(
            $this->permissionService->userHasPermission(
                $this->targetUser,
                'test.permission'
            )
        );
    }

    /** @test */
    public function can_assign_role_to_user()
    {
        $this->permissionService->assignRoleToUser(
            $this->targetUser,
            $this->role,
            $this->admin,
            null,
            'Test assignment'
        );

        $roles = $this->permissionService->getUserRoles($this->targetUser);
        $this->assertCount(1, $roles);
        $this->assertEquals($this->role->id, $roles[0]->role_id);
    }

    /** @test */
    public function can_assign_project_specific_role()
    {
        $projectId = 1;

        $this->permissionService->assignRoleToUser(
            $this->targetUser,
            $this->role,
            $this->admin,
            $projectId,
            'Project manager override'
        );

        $roles = $this->permissionService->getUserRoles($this->targetUser, $projectId);
        $this->assertCount(1, $roles);
        $this->assertEquals($projectId, $roles[0]->project_id);
    }

    /** @test */
    public function can_remove_role_from_user()
    {
        $this->permissionService->assignRoleToUser(
            $this->targetUser,
            $this->role,
            $this->admin
        );

        $this->permissionService->removeRoleFromUser(
            $this->targetUser,
            $this->role
        );

        $roles = $this->permissionService->getUserRoles($this->targetUser);
        $this->assertCount(0, $roles);
    }

    /** @test */
    public function can_set_temporary_role_expiration()
    {
        $expiresAt = now()->addDays(30);

        $this->permissionService->assignRoleToUser(
            $this->targetUser,
            $this->role,
            $this->admin,
            null,
            'Temporary role',
            $expiresAt
        );

        $roles = $this->permissionService->getUserRoles($this->targetUser);
        $this->assertNotNull($roles[0]->expires_at);
    }

    /** @test */
    public function can_detect_expired_roles()
    {
        $expiredDate = now()->subDay();

        $this->permissionService->assignRoleToUser(
            $this->targetUser,
            $this->role,
            $this->admin,
            null,
            'Expired role',
            $expiredDate
        );

        $this->assertTrue($this->permissionService->hasExpiredRoles($this->targetUser));
    }

    /** @test */
    public function can_get_permission_audit_trail()
    {
        $this->permissionService->grantPermissionToUser(
            $this->targetUser,
            $this->permission,
            $this->admin,
            'Testing'
        );

        $this->permissionService->assignRoleToUser(
            $this->targetUser,
            $this->role,
            $this->admin,
            null,
            'Test role'
        );

        $trail = $this->permissionService->getPermissionAuditTrail($this->targetUser);

        $this->assertArrayHasKey('permissions', $trail);
        $this->assertArrayHasKey('roles', $trail);
        $this->assertCount(1, $trail['permissions']);
        $this->assertCount(1, $trail['roles']);
    }

    /** @test */
    public function can_get_users_with_specific_permission()
    {
        $this->permissionService->grantPermissionToUser(
            $this->targetUser,
            $this->permission,
            $this->admin
        );

        $this->actingAs($this->admin)
            ->getJson(route('permissions.users', $this->permission))
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $this->targetUser->id]);
    }

    /** @test */
    public function can_bulk_update_permissions()
    {
        $user2 = User::factory()->create();

        $this->actingAs($this->admin)
            ->postJson(route('permissions.bulk-update'), [
                'user_ids' => [$this->targetUser->id, $user2->id],
                'permission_ids' => [$this->permission->id],
                'action' => 'grant',
                'reason' => 'Bulk test',
            ])
            ->assertStatus(200);

        $this->assertTrue(
            $this->permissionService->userHasPermission(
                $this->targetUser,
                'test.permission'
            )
        );

        $this->assertTrue(
            $this->permissionService->userHasPermission(
                $user2,
                'test.permission'
            )
        );
    }

    /** @test */
    public function non_admin_cannot_manage_permissions()
    {
        $regularUser = User::factory()->create();

        $this->actingAs($regularUser)
            ->postJson(
                route('users.permissions.grant', [$this->targetUser, $this->permission])
            )
            ->assertStatus(403);
    }
}

