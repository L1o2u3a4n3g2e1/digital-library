import 'dotenv/config';
import app from './api-lib/app.js';
import config from './api-lib/config.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const isExecutedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isExecutedDirectly) {
  app.listen(config.port, () => {
    console.log(`Digital Library server listening on http://localhost:${config.port}`);
  });
}

export default app;
