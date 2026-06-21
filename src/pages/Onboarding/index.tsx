import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import RouteLoadingSpinner from '../../components/RouteLoadingSpinner';
import { useAuth } from '../../contexts/auth-context';
import { useLocalData } from '../../contexts/local-data-context';
import apiService from '../../services/api';
import { needsOnboarding } from '../../utils/onboarding-utils';
import EquipmentStep from './EquipmentStep';
import ProfileStep, { type ProfileDraft } from './ProfileStep';
import SessionAndSettingsStep, { type SettingsDraft } from './SessionAndSettingsStep';

const STEPS = ['profile', 'equipment', 'getStarted'] as const;

const OnboardingPage: React.FC = () => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { lang } = useParams();
  const { user, loading, updateUser } = useAuth();
  const { syncNow } = useLocalData();

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [equipmentAdded, setEquipmentAdded] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({
    firstName: '',
    lastName: '',
    bio: '',
    picture: '',
  });
  const [settingsDraft, setSettingsDraft] = useState<SettingsDraft>({
    syncEnabled: true,
    sharingEnabled: false,
  });

  useEffect(() => {
    if (user) {
      setProfileDraft({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        picture: user.picture || '',
      });
      setSettingsDraft({
        syncEnabled: user.syncTrainingsAndEquipment ?? true,
        sharingEnabled: user.shareProgressEnabled ?? false,
      });
    }
  }, [user]);

  const leavingRef = useRef(false);

  useEffect(() => {
    if (leavingRef.current) return;
    if (!loading && user && !needsOnboarding(user)) {
      navigate(`/${lang}/home`, { replace: true });
    }
  }, [user, loading, lang, navigate]);

  const stepLabels = useMemo(
    () => [
      t('onboarding.steps.profile'),
      t('onboarding.steps.equipment'),
      t('onboarding.steps.getStarted'),
    ],
    [t],
  );

  const saveProfileDraft = async () => {
    if (!user) return;
    const updated = await apiService.updateProfile({
      firstName: profileDraft.firstName,
      lastName: profileDraft.lastName,
      bio: profileDraft.bio,
      picture: profileDraft.picture,
    });
    updateUser(updated);
  };

  const finishOnboarding = async (redirectTo: 'home' | 'trainings-add' = 'home') => {
    if (!user) return;
    leavingRef.current = true;
    setSubmitting(true);
    try {
      const updated = await apiService.updateProfile({
        firstName: profileDraft.firstName,
        lastName: profileDraft.lastName,
        bio: profileDraft.bio,
        picture: profileDraft.picture,
        syncTrainingsAndEquipment: settingsDraft.syncEnabled,
        shareProgressEnabled: settingsDraft.sharingEnabled,
        onboardingCompletedAt: new Date().toISOString(),
      });
      updateUser(updated);

      navigate(redirectTo === 'trainings-add' ? `/${lang}/trainings?add=1` : `/${lang}/home`, {
        replace: true,
        state: redirectTo === 'trainings-add' ? { openAddForm: true } : undefined,
      });

      if (settingsDraft.syncEnabled) {
        void syncNow();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = async () => {
    if (activeStep === 0) {
      setSubmitting(true);
      try {
        await saveProfileDraft();
        setActiveStep(1);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (activeStep === 1) {
      setActiveStep(2);
      return;
    }

    await finishOnboarding();
  };

  const handleSkip = async () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((s) => s + 1);
      return;
    }
    await finishOnboarding();
  };

  if (loading || !user) {
    return <RouteLoadingSpinner />;
  }

  if (!needsOnboarding(user)) {
    return null;
  }

  const isLastStep = activeStep === STEPS.length - 1;

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('onboarding.title')}
      </Typography>

      {isMobile ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('onboarding.stepProgress', {
            current: activeStep + 1,
            total: STEPS.length,
            defaultValue: `Step ${activeStep + 1} of ${STEPS.length}`,
          })}
        </Typography>
      ) : (
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {stepLabels.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {stepLabels[activeStep]}
        </Typography>

        {activeStep === 0 && (
          <ProfileStep userId={user.id} value={profileDraft} onChange={setProfileDraft} />
        )}
        {activeStep === 1 && (
          <EquipmentStep
            equipmentAdded={equipmentAdded}
            onEquipmentAdded={() => setEquipmentAdded(true)}
          />
        )}
        {activeStep === 2 && (
          <SessionAndSettingsStep
            settings={settingsDraft}
            submitting={submitting}
            onSettingsChange={setSettingsDraft}
            onCreateFirstTrainingSession={() => finishOnboarding('trainings-add')}
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
          <Button onClick={handleSkip} disabled={submitting}>
            {t('onboarding.skip')}
          </Button>
          <Button variant="contained" onClick={handleContinue} disabled={submitting}>
            {isLastStep ? t('onboarding.finish') : t('onboarding.continue')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OnboardingPage;
