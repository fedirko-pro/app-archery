import { describe, expect, it } from 'vitest';

import { computeDownscaledDimensions } from './image-resize';

describe('image-resize', () => {
  describe('computeDownscaledDimensions', () => {
    it('returns original dimensions when within max', () => {
      expect(computeDownscaledDimensions(800, 600, 2048)).toEqual({ width: 800, height: 600 });
    });

    it('scales down preserving aspect ratio', () => {
      expect(computeDownscaledDimensions(4096, 2048, 2048)).toEqual({
        width: 2048,
        height: 1024,
      });
    });

    it('scales tall images by height', () => {
      expect(computeDownscaledDimensions(1000, 3000, 1500)).toEqual({
        width: 500,
        height: 1500,
      });
    });
  });
});
