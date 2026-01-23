/**
 * Startup script for webhook workers
 * This script starts the webhook processing worker and monitoring in the background
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting webhook workers...');

// Start the webhook worker
const webhookWorker = spawn('npx', ['ts-node', '--esm', './src/workers/webhook-worker.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

webhookWorker.on('error', (err) => {
  console.error('Failed to start webhook worker:', err);
});

// Start the monitoring
const monitor = spawn('npx', ['ts-node', '--esm', './src/monitoring/webhook-monitor.ts'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

monitor.on('error', (err) => {
  console.error('Failed to start webhook monitor:', err);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down workers');
  webhookWorker.kill();
  monitor.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down workers');
  webhookWorker.kill();
  monitor.kill();
  process.exit(0);
});