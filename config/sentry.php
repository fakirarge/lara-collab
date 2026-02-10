<?php

return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),

    // Capture X% of transactions for performance monitoring
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.2),

    // Send default PII (Personally Identifiable Information)
    'send_default_pii' => false,

    'breadcrumbs' => [
        // Capture SQL queries
        'sql_queries' => env('SENTRY_BREADCRUMBS_SQL_QUERIES', true),

        // Capture bindings on SQL queries
        'sql_bindings' => env('SENTRY_BREADCRUMBS_SQL_BINDINGS', false),

        // Capture default user context
        'user' => true,
    ],

    'tracing' => [
        // Trace queue jobs
        'queue_job_transactions' => env('SENTRY_TRACE_QUEUE_ENABLED', false),
        'queue_jobs' => true,

        // Capture queue job as a span
        'queue_info' => true,

        // Define SQL queries threshold
        'sql_queries' => true,
        'sql_origin' => true,

        // HTTP client requests
        'http_client_requests' => true,

        // Redis operations
        'redis_commands' => env('SENTRY_TRACE_REDIS_COMMANDS', false),
    ],

    'environment' => env('APP_ENV', 'production'),

    // Ignore these exceptions
    'ignore_exceptions' => [
        Illuminate\Auth\AuthenticationException::class,
        Illuminate\Validation\ValidationException::class,
        Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
    ],

    // Before send callback
    'before_send' => function (\Sentry\Event $event): ?\Sentry\Event {
        // Don't send events in local environment
        if (app()->environment('local')) {
            return null;
        }

        return $event;
    },

    // Performance monitoring
    'performance' => [
        'slow_query_threshold' => env('SENTRY_SLOW_QUERY_THRESHOLD', 100), // ms
        'slow_request_threshold' => env('SENTRY_SLOW_REQUEST_THRESHOLD', 1000), // ms
    ],
];
