import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './PatrolList.scss';
import UserCard from '../UserCard/UserCard.tsx';
import Box from '@mui/material/Box';
import { useState } from 'react';

export default function PatrolList() {
  const [expanded, setExpanded] = useState<string | false>('false');

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : 'false');
  };

  const getLeader = (users: any[]) => {
    return users.find((user: any) => user.role === 'leader');
  };

  const patrols = [
    {
      id: 1,
      users: [
        {
          id: 1,
          avatar: 'https://i.pravatar.cc/100?img=1',
          firstName: 'Robin Hood',
          lastName: 'Doe',
          role: 'leader',
        },
        {
          id: 2,
          avatar: 'https://i.pravatar.cc/100?img=2',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'member',
        },
        {
          id: 3,
          avatar: 'https://i.pravatar.cc/100?img=3',
          firstName: 'Michael',
          lastName: 'Brown',
          role: 'member',
        },
        {
          id: 4,
          avatar: 'https://i.pravatar.cc/100?img=4',
          firstName: 'Emily',
          lastName: 'Davis',
          role: 'judge',
        },
        {
          id: 5,
          avatar: 'https://i.pravatar.cc/100?img=5',
          firstName: 'Christopher',
          lastName: 'Wilson',
          role: 'judge',
        },
        {
          id: 6,
          avatar: 'https://i.pravatar.cc/100?img=6',
          firstName: 'Sophia',
          lastName: 'Taylor',
          role: 'member',
        },
      ],
    },
    {
      id: 2,
      users: [
        {
          id: 1,
          avatar: 'https://i.pravatar.cc/100?img=7',
          firstName: 'Olivia',
          lastName: 'Martinez',
          role: 'leader',
        },
        {
          id: 2,
          avatar: 'https://i.pravatar.cc/100?img=8',
          firstName: 'James',
          lastName: 'Anderson',
          role: 'member',
        },
        {
          id: 3,
          avatar: 'https://i.pravatar.cc/100?img=9',
          firstName: 'Ava',
          lastName: 'Thomas',
          role: 'member',
        },
        {
          id: 4,
          avatar: 'https://i.pravatar.cc/100?img=10',
          firstName: 'Liam',
          lastName: 'Jackson',
          role: 'judge',
        },
        {
          id: 5,
          avatar: 'https://i.pravatar.cc/100?img=11',
          firstName: 'Isabella',
          lastName: 'White',
          role: 'judge',
        },
        {
          id: 6,
          avatar: 'https://i.pravatar.cc/100?img=12',
          firstName: 'Mason',
          lastName: 'Harris',
          role: 'member',
        },
      ],
    },
    {
      id: 3,
      users: [
        {
          id: 1,
          avatar: 'https://i.pravatar.cc/100?img=13',
          firstName: 'Lucas',
          lastName: 'Clark',
          role: 'leader',
        },
        {
          id: 2,
          avatar: 'https://i.pravatar.cc/100?img=14',
          firstName: 'Mia',
          lastName: 'Rodriguez',
          role: 'member',
        },
        {
          id: 3,
          avatar: 'https://i.pravatar.cc/100?img=15',
          firstName: 'Ethan',
          lastName: 'Lewis',
          role: 'member',
        },
        {
          id: 4,
          avatar: 'https://i.pravatar.cc/100?img=16',
          firstName: 'Charlotte',
          lastName: 'Lee',
          role: 'judge',
        },
        {
          id: 5,
          avatar: 'https://i.pravatar.cc/100?img=17',
          firstName: 'Alexander',
          lastName: 'Walker',
          role: 'judge',
        },
        {
          id: 6,
          avatar: 'https://i.pravatar.cc/100?img=18',
          firstName: 'Amelia',
          lastName: 'Hall',
          role: 'member',
        },
      ],
    },
    {
      id: 4,
      users: [
        {
          id: 1,
          avatar: 'https://i.pravatar.cc/100?img=19',
          firstName: 'Henry',
          lastName: 'Young',
          role: 'leader',
        },
        {
          id: 2,
          avatar: 'https://i.pravatar.cc/100?img=20',
          firstName: 'Harper',
          lastName: 'Hernandez',
          role: 'member',
        },
        {
          id: 3,
          avatar: 'https://i.pravatar.cc/100?img=21',
          firstName: 'Sebastian',
          lastName: 'King',
          role: 'member',
        },
        {
          id: 4,
          avatar: 'https://i.pravatar.cc/100?img=22',
          firstName: 'Evelyn',
          lastName: 'Wright',
          role: 'judge',
        },
        {
          id: 5,
          avatar: 'https://i.pravatar.cc/100?img=23',
          firstName: 'Jack',
          lastName: 'Lopez',
          role: 'judge',
        },
        {
          id: 6,
          avatar: 'https://i.pravatar.cc/100?img=24',
          firstName: 'Abigail',
          lastName: 'Scott',
          role: 'member',
        },
      ],
    },
    {
      id: 5,
      users: [
        {
          id: 1,
          avatar: 'https://i.pravatar.cc/100?img=25',
          firstName: 'Daniel',
          lastName: 'Adams',
          role: 'leader',
        },
        {
          id: 2,
          avatar: 'https://i.pravatar.cc/100?img=26',
          firstName: 'Ella',
          lastName: 'Baker',
          role: 'member',
        },
        {
          id: 3,
          avatar: 'https://i.pravatar.cc/100?img=27',
          firstName: 'Matthew',
          lastName: 'Gonzalez',
          role: 'member',
        },
        {
          id: 4,
          avatar: 'https://i.pravatar.cc/100?img=28',
          firstName: 'Scarlett',
          lastName: 'Perez',
          role: 'judge',
        },
        {
          id: 5,
          avatar: 'https://i.pravatar.cc/100?img=29',
          firstName: 'David',
          lastName: 'Sanchez',
          role: 'judge',
        },
        {
          id: 6,
          avatar: 'https://i.pravatar.cc/100?img=30',
          firstName: 'Victoria',
          lastName: 'Ramirez',
          role: 'member',
        },
      ],
    },
  ];

  return (
    <section>
      <div className="container">
        <h1>Test tournament 2024 (demo)</h1>
        <h2>Patrols list</h2>
        {patrols.map((patrol) => (
          <Accordion
            key={'panel' + patrol.id}
            expanded={expanded === 'panel' + patrol.id}
            onChange={handleChange('panel' + patrol.id)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={'panel' + patrol.id + '1bh-content'}
              id={'panel' + patrol.id + '1bh-content'}
            >
              <Box
                sx={{
                  fontWeight: 'bold',
                  marginRight: '8px',
                  alignContent: 'center',
                }}
              >
                #{patrol.id}
              </Box>
              <UserCard user={getLeader(patrol.users)} />
            </AccordionSummary>
            <AccordionDetails>
              {patrol.users.map((user) => (
                <UserCard user={user} key={user.id} />
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
        <Box className="right_wrapper" sx={{ marginTop: '16px' }}>
          <button
            type="button"
            className="button add"
            // onClick={handleAddItem}
          >
            +
          </button>
        </Box>
      </div>
    </section>
  );
}
