<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create table for user-specific permission overrides
        Schema::create('user_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->boolean('allowed')->default(true); // true = grant, false = deny
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason')->nullable(); // e.g., "Project Manager override"
            $table->timestamps();
            $table->unique(['user_id', 'permission_id']);
            $table->index(['user_id', 'allowed']);
        });

        // Create table for user-specific role overrides
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete(); // Project-specific role
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason')->nullable();
            $table->timestamp('expires_at')->nullable(); // Temporary role assignment
            $table->timestamps();
            $table->unique(['user_id', 'role_id', 'project_id']);
            $table->index(['user_id', 'project_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('user_permissions');
    }
};

