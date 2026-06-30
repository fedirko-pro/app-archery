import LangLayoutClient from './LangLayoutClient';

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;
  return <LangLayoutClient lang={lang}>{children}</LangLayoutClient>;
}
