const { rmSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
rmSync('.test-build', { recursive: true, force: true });
const compile = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.test.json'], { stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status ?? 1);
const tests = spawnSync(process.execPath, ['--test', 'tests/exam.test.cjs'], { stdio: 'inherit' });
process.exit(tests.status ?? 1);
