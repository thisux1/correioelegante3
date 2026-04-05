export const LEGAL_DOCUMENT_VERSIONS = {
  terms: 'v1',
  privacy: 'v1',
  cookies: 'v1',
} as const;

export type LegalDocumentType = keyof typeof LEGAL_DOCUMENT_VERSIONS;
