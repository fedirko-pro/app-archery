import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Link as MuiLink, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import apiService from '../../services/api';
import type { RuleDto } from '../../services/types';

/**
 * Rules page shows a list of rule documents with description and links.
 * Supports hash-based expansion: /rules#IFAA opens IFAA rule.
 */
const Rules: React.FC = () => {
  const [rules, setRules] = useState<RuleDto[]>([]);
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState<string | false>(false);
  const { hash } = useLocation();

  useEffect(() => {
    const load = async () => {
      const data = await apiService.getRules();
      setRules(data);
    };
    load();
  }, []);

  useEffect(() => {
    const anchor = decodeURIComponent((hash || '').replace(/^#/, ''));
    if (!anchor) return;
    // If anchor matches rule_code or part of citation, expand it
    const match = rules.find((r) => r.rule_code.toLowerCase() === anchor.toLowerCase());
    if (match) {
      setExpanded(match.rule_code);
      // Scroll into view after expansion paints
      requestAnimationFrame(() => {
        const el = document.getElementById(`rule-${match.rule_code}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [hash, rules]);

  const buildDownloadHref = (download_link?: string) => {
    if (!download_link) return undefined;
    // Prefer files served from public/pdf/rules
    if (download_link.startsWith('http')) return download_link;
    return `/pdf/rules/${download_link.replace(/^\/+/, '')}`;
  };

  return (
    <section>
      <div className="container">
        <Typography variant="h4" gutterBottom>{t('pages.rules.title')}</Typography>

        {rules.map((rule) => (
          <Accordion
            key={rule.rule_code}
            expanded={expanded === rule.rule_code}
            onChange={(_, isExpanded) => {
              setExpanded(isExpanded ? rule.rule_code : false);
              if (isExpanded) {
                requestAnimationFrame(() => {
                  const el = document.getElementById(`rule-${rule.rule_code}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
              }
            }}
            sx={{ mb: 1 }}
          >
            <AccordionSummary id={`rule-${rule.rule_code}`} expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 1 }}>
                {rule.rule_code}
              </Typography>
              <Typography variant="subtitle1">{rule.rule_name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {rule.edition && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {rule.edition}
                </Typography>
              )}
              <Box sx={{ whiteSpace: 'pre-wrap' }}>{rule.description}</Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {rule.link && (
                  <MuiLink href={rule.link} target="_blank" rel="noopener noreferrer">
                    {t('pages.rules.openOfficialPage')}
                  </MuiLink>
                )}
                {buildDownloadHref(rule.download_link) && (
                  <Button variant="outlined" component="a" href={buildDownloadHref(rule.download_link)} download>
                    {t('pages.rules.downloadPdf')}
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </section>
  );
};

export default Rules;


