module.exports = {
  apps: [{
    name: 'webhook-worker',
    script: './src/workers/webhook-worker.ts',
    interpreter: 'ts-node',
    interpreter_args: '--project tsconfig.node.json --transpile-only',
    instances: 1, // Single instance for webhook processing
    exec_mode: 'fork',
    autorestart: true, // Automatically restart if crashed
    watch: false, // Don't watch for file changes in production
    max_memory_restart: '1G', // Restart if memory exceeds 1GB
    error_file: './logs/worker-err.log',
    out_file: './logs/worker-out.log',
    log_file: './logs/worker-combined.log',
    time: true,
    env: {
      NODE_ENV: 'production',
      CORE_AI_SERVICE_URL: process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000',
      CORE_AI_SERVICE_API_KEY: process.env.CORE_AI_SERVICE_API_KEY || ''
    }
  }, {
    name: 'webhook-monitor',
    script: './src/monitoring/webhook-monitor.ts',
    interpreter: 'ts-node',
    interpreter_args: '--project tsconfig.node.json --transpile-only',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    error_file: './logs/monitor-err.log',
    out_file: './logs/monitor-out.log',
    log_file: './logs/monitor-combined.log',
    time: true,
    env: {
      NODE_ENV: 'production',

    }
  }]
};