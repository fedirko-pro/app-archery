import React from 'react';

import { useAthleteTabBarVisible } from '../../hooks/use-athlete-tab-bar-visible';
import BottomTabBar from '../BottomTabBar';
import Footer from '../Footer/Footer';

/**
 * Renders athlete bottom tabs on mobile (non-auth/admin), otherwise the website footer.
 * Auth screens keep the standard footer (no tab bar).
 */
const AppBottomChrome: React.FC = () => {
  const showTabs = useAthleteTabBarVisible();

  if (showTabs) {
    return (
      <>
        <div className="bottom-tab-bar-spacer" aria-hidden="true" />
        <BottomTabBar />
      </>
    );
  }

  return <Footer />;
};

export default AppBottomChrome;
