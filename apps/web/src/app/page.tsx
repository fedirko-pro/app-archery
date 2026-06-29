import { redirect } from 'next/navigation';

import { getDefaultAppLang } from '@/utils/i18n-lang';

export default function RootPage() {
  redirect(`/${getDefaultAppLang()}/tournaments`);
}
