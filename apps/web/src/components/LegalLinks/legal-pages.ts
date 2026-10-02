export const LEGAL_LINKS = [
  { id: 'privacy', path: '/privacy' },
  { id: 'terms', path: '/terms' },
  { id: 'notice', path: '/legal-notice' },
  { id: 'cancellation', path: '/cancellation' },
] as const;

export type LegalPageId = (typeof LEGAL_LINKS)[number]['id'];

export const LEGAL_SECTIONS: Record<LegalPageId, readonly string[]> = {
  privacy: [
    'controller',
    'data',
    'purposes',
    'bases',
    'cookies',
    'sharing',
    'retention',
    'rights',
    'children',
    'changes',
  ],
  terms: [
    'agreement',
    'service',
    'accounts',
    'use',
    'content',
    'organizers',
    'availability',
    'payments',
    'liability',
    'ending',
    'law',
  ],
  notice: ['operator', 'contact', 'sites', 'content'],
  cancellation: ['now', 'withdrawal', 'how', 'exceptions', 'contact'],
};
