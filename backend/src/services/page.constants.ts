export const MAX_BLOCKS = 30;
export const MAX_PAGE_BYTES = 500_000;
export const MAX_TEXT_CHARS = 5_000;
export const PAGE_VERSION = 1;
export const BLOCK_VERSION = 1;

export const BLOCK_TYPE_VALUES = ['text', 'image', 'timer', 'gallery', 'music', 'video'] as const;

export type SupportedBlockType = (typeof BLOCK_TYPE_VALUES)[number];
