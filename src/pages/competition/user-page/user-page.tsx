import './user-page.scss';

import { LockOpen } from '@mui/icons-material';
import {
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Box from '@mui/material/Box';

export default function UserPage() {
  // const [totalResult, setTotalResult] = React.useState(0);
  const rows = [
    {
      id: 1,
      targetNumber: 1,
      arrows: [
        { id: 1, value: 10 },
        { id: 2, value: 8 },
        { id: 3, value: 5 },
      ],
      total: 23,
    },
    {
      id: 2,
      targetNumber: 2,
      arrows: [
        { id: 1, value: 8 },
        { id: 2, value: 8 },
        { id: 3, value: 10 },
      ],
      total: 26,
    },
    {
      id: 3,
      targetNumber: 3,
      arrows: [
        { id: 1, value: 5 },
        { id: 2, value: 0 },
        { id: 3, value: 10 },
      ],
      total: 15,
    },
    {
      id: 4,
      targetNumber: 4,
      arrows: [
        { id: 1, value: 10 },
        { id: 2, value: 10 },
        { id: 3, value: 10 },
      ],
      total: 30,
    },
    {
      id: 5,
      targetNumber: 5,
      arrows: [
        { id: 1, value: 0 },
        { id: 2, value: 5 },
        { id: 3, value: 8 },
      ],
      total: 13,
    },
    {
      id: 6,
      targetNumber: 6,
      arrows: [
        { id: 1, value: 8 },
        { id: 2, value: 8 },
        { id: 3, value: 8 },
      ],
      total: 24,
    },
    {
      id: 7,
      targetNumber: 7,
      arrows: [
        { id: 1, value: 5 },
        { id: 2, value: 5 },
        { id: 3, value: 5 },
      ],
      total: 15,
    },
    {
      id: 8,
      targetNumber: 8,
      arrows: [
        { id: 1, value: 0 },
        { id: 2, value: 0 },
        { id: 3, value: 0 },
      ],
      total: 0,
    },
    {
      id: 9,
      targetNumber: 9,
      arrows: [
        { id: 1, value: 10 },
        { id: 2, value: 5 },
        { id: 3, value: 8 },
      ],
      total: 23,
    },
    {
      id: 10,
      targetNumber: 10,
      arrows: [
        { id: 1, value: 8 },
        { id: 2, value: 0 },
        { id: 3, value: 5 },
      ],
      total: 13,
    },
    {
      id: 11,
      targetNumber: 11,
      arrows: [
        { id: 1, value: 10 },
        { id: 2, value: 10 },
        { id: 3, value: 0 },
      ],
      total: 20,
    },
    {
      id: 12,
      targetNumber: 12,
      arrows: [
        { id: 1, value: 5 },
        { id: 2, value: 8 },
        { id: 3, value: 10 },
      ],
      total: 23,
    },
    {
      id: 13,
      targetNumber: 13,
      arrows: [
        { id: 1, value: 8 },
        { id: 2, value: 8 },
        { id: 3, value: 0 },
      ],
      total: 16,
    },
    {
      id: 14,
      targetNumber: 14,
      arrows: [
        { id: 1, value: 10 },
        { id: 2, value: 5 },
        { id: 3, value: 5 },
      ],
      total: 20,
    },
    {
      id: 15,
      targetNumber: 15,
      arrows: [
        { id: 1, value: 0 },
        { id: 2, value: 10 },
        { id: 3, value: 8 },
      ],
      total: 18,
    },
    {
      id: 16,
      targetNumber: 16,
      arrows: [
        { id: 1, value: 5 },
        { id: 2, value: 10 },
        { id: 3, value: 8 },
      ],
      total: 23,
    },
    {
      id: 17,
      targetNumber: 17,
      arrows: [
        { id: 1, value: 0 },
        { id: 2, value: 5 },
        { id: 3, value: 5 },
      ],
      total: 10,
    },
    {
      id: 18,
      targetNumber: 18,
      arrows: [
        { id: 1, value: 8 },
        { id: 2, value: 10 },
        { id: 3, value: 8 },
      ],
      total: 26,
    },
  ];

  let sum = 0;

  return (
    <section>
      <div className="container user_page">
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2}>
                  <h2>
                    Robert Hood
                    <span className="locked">
                      <LockOpen />
                    </span>
                  </h2>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}>
                  <h3>Test tournament 2024 (demo)</h3>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">Patrol №</TableCell>
                <TableCell align="right">13</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">category</TableCell>
                <TableCell align="right">HLB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">date</TableCell>
                <TableCell align="right">19.05.2024</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className="container">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  '&:last-child td': { border: 0 },
                  backgroundColor: 'lightgrey',
                }}
              >
                <TableCell
                  align="center"
                  sx={{
                    borderRight: '1px solid lightgrey',
                    padding: '4px',
                  }}
                >
                  Set
                </TableCell>
                {rows[0].arrows.map((arrow, index) => (
                  <TableCell align="center" key={arrow.id}>
                    {index + 1}
                  </TableCell>
                ))}
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'lightgrey',
                    padding: '4px',
                    textAlign: 'center',
                  }}
                >
                  Sum
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    padding: '4px',
                  }}
                >
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const subSum = sum + row.total;
                sum = sum + row.total;
                return (
                  <TableRow
                    key={row.targetNumber}
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        padding: '4px',
                      }}
                    >
                      <b>{row.targetNumber}</b>
                    </TableCell>
                    {row.arrows.map((arrow) => (
                      <TableCell
                        key={arrow.id}
                        sx={{
                          padding: 0,
                          textAlign: 'center',
                        }}
                      >
                        {/*{arrow.value}*/}
                        <FormControl fullWidth>
                          <Select
                            // labelId="demo-simple-select-label"
                            // id="demo-simple-select"
                            value={arrow.value}
                            // label="Age"
                            // onChange={handleChange}
                          >
                            <MenuItem value={10} sx={{ color: 'green' }}>
                              10
                            </MenuItem>
                            <MenuItem value={8}>8</MenuItem>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={0}>0</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: 'lightgrey',
                        padding: '4px',
                      }}
                    >
                      {row.total}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: '4px',
                      }}
                    >
                      {subSum}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell colSpan={5}>Total scores:</TableCell>
                <TableCell
                  sx={{
                    backgroundColor: 'lightgreen',
                  }}
                >
                  <b>{sum}</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          className="right_wrapper"
          sx={{
            marginTop: '16px',
          }}
        >
          <button
            type="button"
            className="button submit"
            // onClick={handleAddItem}
          >
            Submit
          </button>
        </Box>
      </div>
    </section>
  );
}
