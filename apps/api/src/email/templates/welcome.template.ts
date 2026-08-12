import { EmailI18n, interpolate } from '../i18n';
import { styleBody, styleHeading } from './theme';

export interface WelcomeContentParams {
  firstName: string;
}

export function getWelcomeContent(
  params: WelcomeContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { firstName } = params;
  const s = t.welcome;

  const greeting = interpolate(s.greeting, { name: firstName });
  const [f1, f2, f3, f4] = s.features;

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p style="${styleBody()}">${greeting}</p>
    <p style="${styleBody()}">${s.intro}</p>
    <ul style="padding-left:20px; margin:16px 0;">
      <li style="${styleBody()}">${f1}</li>
      <li style="${styleBody()}">${f2}</li>
      <li style="${styleBody()}">${f3}</li>
      <li style="${styleBody()}">${f4}</li>
    </ul>
    <p style="${styleBody()}">${s.helpNote}</p>
  `;

  const text = `
${s.heading}

${greeting}

${s.intro}

- ${f1}
- ${f2}
- ${f3}
- ${f4}

${s.helpNote}
`.trim();

  return { html, text };
}
