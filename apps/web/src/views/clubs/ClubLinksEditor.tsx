import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ClubLinkDto } from '../../services/types';

interface ClubLinksEditorProps {
  value: ClubLinkDto[];
  onChange: (links: ClubLinkDto[]) => void;
}

const ClubLinksEditor: React.FC<ClubLinksEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslation('common');

  const handleAdd = () => {
    onChange([...value, { label: '', url: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ClubLinkDto, fieldValue: string) => {
    onChange(value.map((link, i) => (i === index ? { ...link, [field]: fieldValue } : link)));
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {t('pages.clubs.links', 'Links')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('pages.clubs.linksHelp', 'Website, social media, and other links')}
      </Typography>
      <Stack spacing={2}>
        {value.map((link, index) => (
          <Stack
            key={index}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems="flex-start"
          >
            <TextField
              label={t('pages.clubs.linkLabel', 'Label')}
              value={link.label}
              onChange={(e) => handleChange(index, 'label', e.target.value)}
              size="small"
              sx={{ flex: 1, width: '100%' }}
            />
            <TextField
              label={t('pages.clubs.linkUrl', 'URL')}
              value={link.url}
              onChange={(e) => handleChange(index, 'url', e.target.value)}
              size="small"
              sx={{ flex: 2, width: '100%' }}
              placeholder="https://"
            />
            <IconButton
              aria-label={t('common.delete', 'Delete')}
              onClick={() => handleRemove(index)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
        <Button startIcon={<AddIcon />} onClick={handleAdd} sx={{ alignSelf: 'flex-start' }}>
          {t('pages.clubs.addLink', 'Add link')}
        </Button>
      </Stack>
    </Box>
  );
};

export default ClubLinksEditor;
