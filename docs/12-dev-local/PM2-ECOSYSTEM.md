# PM2 Ecosystem — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [SETUP.md](./SETUP.md) |

---

## ecosystem.config.cjs (objetivo)

```javascript
const path = require('path');
const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'tuturno-api',
      cwd: path.join(root, 'backend'),
      script: 'dist/index.js', // o tsx src/index.ts en dev
      env: { NODE_ENV: 'development', PORT: '4013' },
    },
    {
      name: 'tuturno-web',
      cwd: path.join(root, 'frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 4010',
    },
    {
      name: 'tuturno-panel',
      cwd: path.join(root, 'panel'),
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 4011',
    },
    {
      name: 'tuturno-admin',
      cwd: path.join(root, 'panel-super'),
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 4012',
    },
    {
      name: 'tuturno-worker',
      cwd: path.join(root, 'backend'),
      script: 'dist/workers/notificationWorker.js',
      env: { NODE_ENV: 'development' },
    },
  ],
};
```

---

## Comandos

```bash
pm2 start ecosystem.config.cjs
pm2 logs tuturno-api
pm2 restart all
pm2 save
```

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
