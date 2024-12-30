import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { Delete } from '@mui/icons-material';
import AlertDialog from '../components/Dialogs/AlertDialog.jsx';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import InfoIcon from '@mui/icons-material/Info';
import InfoDialog from '../components/Dialogs/InfoDialog.jsx';

export default function Training() {
  const [showInfo, setShowInfo] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [activeTraining, setActiveTraining] = useState(null);

  const handleAddItem = () => {
    const newTraining = {
      title: `Training ${trainings.length + 1}`,
      date: new Date(),
      totalScore: 0,
    };
    setTrainings([newTraining, ...trainings]);
  };

  const handleClose = () => {
    setConfirm(false);
    setShowInfo(false);
    console.log('cancel');
  };
  const handleConfirm = () => {
    setConfirm(false);
    handleRemoveItem();
    console.log('delete!');
  };

  const handleRemoveItem = () => {
    console.log('active training - ', activeTraining);
    setTrainings(trainings.filter((elem) => elem.date !== activeTraining));
    setActiveTraining(null);
  };

  useEffect(() => {
    setTrainings([
      {
        title: `Training 1`,
        date: new Date(),
        totalScore: 0,
      },
      {
        title: `Training 2`,
        date: new Date(),
        totalScore: 0,
      },
      {
        title: `Training 3`,
        date: new Date(),
        totalScore: 0,
      },
    ]);
  }, []);

  return (
    <section>
      <InfoDialog
        open={showInfo}
        handleClose={() => handleClose()}
        description={`Chapter "My trainings" allows to create any amount of personal trainings, select target, distance, arrows count, etc.
                For every training detailed statistic is available. User can share his stats.
                IMPORTANT: information from training is not sending anywhere and is stored only on your device (at least now)`}
      />
      <div className="container">
        <h2>
          My trainings&nbsp;
          <button
            className="button clear_button"
            type="button"
            onClick={() => setShowInfo(true)}
          >
            <InfoIcon />
          </button>
        </h2>
        <AlertDialog
          question="Delete training?"
          hint="All resuts for this training will be deleted"
          open={confirm}
          handleClose={() => handleClose()}
          handleConfirm={() => handleConfirm()}
        />
        <List sx={{ width: '100%' }}>
          {trainings.map((training, index) => (
            <ListItem
              className="trainings_item"
              key={index}
              secondaryAction={
                <button
                  className="button clear_button"
                  type="button"
                  aria-label="comment"
                  onClick={() => {
                    setActiveTraining(training.date);
                    setConfirm(true);
                  }}
                >
                  <Delete />
                </button>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <ArrowOutwardIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={training.title}
                secondary={training.date.toLocaleDateString('uk-UA')}
              />
            </ListItem>
          ))}
        </List>
        <div className="right_wrapper">
          <button type="button" className="button add" onClick={handleAddItem}>
            +
          </button>
        </div>
      </div>
    </section>
  );
}
