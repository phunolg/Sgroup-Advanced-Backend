import { spawn } from 'child_process';

process.env.BUILD_OPENAPI = 'true';
const child = spawn('node', ['dist/main.js'], { stdio: 'inherit', env: process.env });

child.on('exit', (code) => process.exit(code ?? 0));
