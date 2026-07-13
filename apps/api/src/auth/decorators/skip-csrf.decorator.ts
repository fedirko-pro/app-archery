import { SetMetadata } from '@nestjs/common';
import { SKIP_CSRF_KEY } from '../guards/csrf.guard';

export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
