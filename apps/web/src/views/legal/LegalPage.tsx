import './LegalPage.scss';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import LegalLinks from '../../components/LegalLinks/LegalLinks';
import { LEGAL_SECTIONS, type LegalPageId } from '../../components/LegalLinks/legal-pages';

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const linkable = /https?:\/\/[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

  for (const match of text.matchAll(linkable)) {
    const raw = match[0];
    const index = match.index ?? 0;
    const trailing = raw.match(/[.,;:)]+$/);
    const value = trailing ? raw.slice(0, -trailing[0].length) : raw;
    if (!value) {
      continue;
    }
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }
    if (value.includes('@')) {
      nodes.push(
        <a key={`${value}-${index}`} href={`mailto:${value}`}>
          {value}
        </a>,
      );
    } else {
      nodes.push(
        <a key={`${value}-${index}`} href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>,
      );
    }
    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

const LegalPage = ({ page }: { page: LegalPageId }) => {
  const { t } = useTranslation('common');

  return (
    <section className="legal-page">
      <div className="container">
        <h2>{t(`legal.${page}.title`)}</h2>
        <p className="legal-page__updated">{t('legal.updated')}</p>
        {LEGAL_SECTIONS[page].map((section) => (
          <section key={section} className="legal-page__section">
            <h3>{t(`legal.${page}.${section}.title`)}</h3>
            {t(`legal.${page}.${section}.body`)
              .split('\n\n')
              .map((paragraph) => (
                <p key={paragraph}>{renderInline(paragraph)}</p>
              ))}
          </section>
        ))}
        <LegalLinks omit={page} />
      </div>
    </section>
  );
};

export default LegalPage;
