// Simple JavaScript wrapper to run the TypeScript webhook worker
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting webhook worker...');

// Use ts-node with proper flags to handle ES modules
const workerProcess = spawn('npx', ['ts-node', '--esm', 'src/workers/webhook-worker.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_OPTIONS: '--loader ts-node/esm'
  }
});

workerProcess.on('close', (code) => {
  console.log(`Webhook worker exited with code ${code}`);
  process.exit(code);
});

workerProcess.on('error', (err) => {
  console.error('Error starting webhook worker:', err);
});