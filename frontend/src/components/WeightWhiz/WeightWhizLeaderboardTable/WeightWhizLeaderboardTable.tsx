import {
  WeightWhizLeaderboardTableProps,
  LeaderboardsData,
} from '../../../types/weightWhizTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { getWeightWhizLeaderboards } from '../../../api/getWeightWhizLeaderboards';
import { displayErrorMessage } from '../../../api/displayErrorMessage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const headers = ['Rank', 'Name', 'Score'];

const WeightWhizzLeaderboardTable = ({
  gameMode,
}: WeightWhizLeaderboardTableProps) => {
  const [leaderboardsData, setLeaderboardsData] =
    useState<LeaderboardsData | null>(null);
  const [errorLeaderboardsData, setErrorLeaderboardsData] = useState<
    string | null
  >(null);

  useEffect(() => {
    const getLeaderboards = async () => {
      try {
        const response = await getWeightWhizLeaderboards();
        setLeaderboardsData(response);
      } catch (error) {
        displayErrorMessage(error, setErrorLeaderboardsData);
      }
    };
    getLeaderboards();
  }, []);

  return (
    <Container className='px-1 mt-4 mb-3 mx-5 d-flex justify-content-center'>
      {errorLeaderboardsData !== null ? (
        <p className='font-jockey'>{errorLeaderboardsData}</p>
      ) : (
        <ThemeProvider theme={darkTheme}>
          <TableContainer
            sx={{ borderRadius: '20px', maxWidth: '400px' }}
            component={Paper}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableCell className='font-jockey' key={header}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboardsData &&
                  leaderboardsData[gameMode]?.map((leaderboardData, index) => (
                    <TableRow key={leaderboardData.name + index.toString()}>
                      <TableCell className='font-jockey'>{index + 1}</TableCell>
                      <TableCell className='font-jockey'>
                        {leaderboardData.name}
                      </TableCell>
                      <TableCell className='font-jockey'>
                        {leaderboardData.score}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ThemeProvider>
      )}
    </Container>
  );
};

export default WeightWhizzLeaderboardTable;
