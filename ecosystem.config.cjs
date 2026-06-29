/**
 * PM2 — monorepo TuTurno (API + web tenant + panel + super admin).
 *
 * Puertos:
 *   - tuturno-web:   4010
 *   - tuturno-panel: 4011
 *   - tuturno-admin: 4012
 *   - tuturno-api:   4013
 *
 * Uso desde la raíz del repositorio (tras builds):
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 */
const path = require('path');

const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'tuturno-api',
      cwd: path.join(root, 'backend'),
      script: 'dist/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '10s',
      max_memory_restart: '800M',
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: '4013',
      },
    },
    {
      name: 'tuturno-web',
      cwd: path.join(root, 'frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4010 -H 0.0.0.0',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '10s',
      max_memory_restart: '1G',
      listen_timeout: 15000,
      kill_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: '4010',
      },
    },
    {
      name: 'tuturno-panel',
      cwd: path.join(root, 'panel'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4011 -H 0.0.0.0',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '10s',
      max_memory_restart: '1G',
      listen_timeout: 15000,
      kill_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: '4011',
      },
    },
    {
      name: 'tuturno-worker',
      cwd: path.join(root, 'backend'),
      script: 'dist/workers/notificationWorker.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '10s',
      max_memory_restart: '600M',
      kill_timeout: 8000,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'tuturno-admin',
      cwd: path.join(root, 'panel-super'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4012 -H 0.0.0.0',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '10s',
      max_memory_restart: '1G',
      listen_timeout: 15000,
      kill_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: '4012',
      },
    },
  ],
};
