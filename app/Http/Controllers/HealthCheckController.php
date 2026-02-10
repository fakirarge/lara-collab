<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthCheckController extends Controller
{
    /**
     * Perform application health check
     */
    public function __invoke(): JsonResponse
    {
        $checks = [
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'environment' => app()->environment(),
            'services' => [],
        ];

        // Database check
        try {
            DB::connection()->getPdo();
            $checks['services']['database'] = 'connected';
        } catch (\Exception $e) {
            $checks['status'] = 'error';
            $checks['services']['database'] = 'disconnected';
        }

        // Cache check
        try {
            $testKey = 'health_check_'.time();
            Cache::put($testKey, 'test', 10);
            Cache::get($testKey);
            Cache::forget($testKey);
            $checks['services']['cache'] = 'working';
        } catch (\Exception $e) {
            $checks['status'] = 'degraded';
            $checks['services']['cache'] = 'error';
        }

        // Queue check (optional)
        try {
            $queueSize = DB::table('jobs')->count();
            $checks['services']['queue'] = [
                'status' => 'operational',
                'pending_jobs' => $queueSize,
            ];
        } catch (\Exception $e) {
            $checks['services']['queue'] = 'unavailable';
        }

        // Storage check
        try {
            $storageWritable = is_writable(storage_path());
            $checks['services']['storage'] = $storageWritable ? 'writable' : 'read-only';
        } catch (\Exception $e) {
            $checks['status'] = 'degraded';
            $checks['services']['storage'] = 'error';
        }

        // Application version
        $checks['version'] = config('app.version', '1.0.0');

        // Response status code based on health
        $statusCode = match ($checks['status']) {
            'ok' => 200,
            'degraded' => 200,
            'error' => 503,
            default => 500,
        };

        return response()->json($checks, $statusCode);
    }
}
