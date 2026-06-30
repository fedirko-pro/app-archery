import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const run = (command) => {
  execSync(command, { stdio: 'inherit' });
};

if (platform() === 'win32') {
  console.log(
    'Windows: skipping standalone next build (symlinks require Developer Mode). Running typecheck + lint...',
  );
  run('pnpm typecheck');
  run('pnpm lint');
} else {
  run('pnpm build');
}
