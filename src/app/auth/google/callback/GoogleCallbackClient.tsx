'use client';

import { BrowserRouter } from 'react-router-dom';

import { ClientOnly } from '@/components/ClientOnly/ClientOnly';
import { AuthProvider } from '@/contexts/auth-context';
import GoogleCallback from '@/views/google-callback/google-callback';

export default function GoogleCallbackClient() {
  return (
    <ClientOnly>
      <BrowserRouter>
        <AuthProvider>
          <GoogleCallback />
        </AuthProvider>
      </BrowserRouter>
    </ClientOnly>
  );
}
