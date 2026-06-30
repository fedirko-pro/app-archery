'use client';

import ShareMenu from './ShareMenu';
import { usePrivacyShareGate } from './usePrivacyShareGate';

interface PrivacyAwareShareMenuProps {
  url: string;
  title: string;
  text?: string;
  imageUrl?: string;
  buttonLabel?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'icon';
  canShare?: boolean;
}

export default function PrivacyAwareShareMenu({
  canShare = true,
  ...shareProps
}: PrivacyAwareShareMenuProps) {
  const { checkCanShare, PrivacyShareDialogs } = usePrivacyShareGate(canShare);

  return (
    <>
      <ShareMenu {...shareProps} onBeforeOpen={checkCanShare} />
      {PrivacyShareDialogs}
    </>
  );
}
