import './LanguageToggler.scss';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React from 'react';

const LanguageToggler: React.FC = () => {
  const [language, setLanguage] = React.useState<string>('en');

  const handleChange = (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) setLanguage(value);
  };

  return (
    <ToggleButtonGroup
      className="language_toggle_button_group"
      value={language}
      exclusive
      onChange={handleChange}
      aria-label="language"
    >
      <ToggleButton value="en">EN</ToggleButton>
      <ToggleButton value="pt">PT</ToggleButton>
      <ToggleButton value="it">IT</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default LanguageToggler;
