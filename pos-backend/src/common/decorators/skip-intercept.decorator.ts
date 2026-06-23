import { SetMetadata } from '@nestjs/common';

export const SKIP_INTERCEPT_KEY = 'skip_intercept';
export const SkipIntercept = () => SetMetadata(SKIP_INTERCEPT_KEY, true);
