const { rmSync, readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
rmSync('.test-build', { recursive: true, force: true });
const compile = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.test.json'], { stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status ?? 1);
const files = readdirSync('tests').filter((f) => f.endsWith('.test.cjs')).sort().map((f) => `tests/${f}`);
const tests = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(tests.status ?? 1);
