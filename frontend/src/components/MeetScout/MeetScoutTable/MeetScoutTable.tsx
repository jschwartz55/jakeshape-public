import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  MeetScoutAthlete,
  MeetScoutTableHeader,
  MeetScoutTableProps,
} from '../../../types/meetScoutTypes';
import { Container } from 'react-bootstrap';
import { MeetScoutTableRow } from '..';
import { useMemo, useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const getHeader = (
  name: string,
  id: keyof MeetScoutAthlete
): MeetScoutTableHeader => {
  return { name: name, id: id };
};

const headers: MeetScoutTableHeader[] = [
  getHeader('Name', 'name'),
  getHeader('Weight Class', 'weightClass'),
  getHeader('Sex', 'sex'),
  getHeader('Age', 'age'),
  getHeader('Equipment', 'equipment'),
  getHeader('Predicted Bodyweight', 'bodyweight'),
  getHeader('Predicted Squat', 'squat'),
  getHeader('Predicted Bench', 'bench'),
  getHeader('Predicted Deadlift', 'deadlift'),
  getHeader('Predicted Total', 'total'),
  getHeader('Predicted Dots', 'dots'),
];

type Order = 'asc' | 'desc';

const MeetScoutTable = ({
  athletes,
  handleEditAthleteData,
}: MeetScoutTableProps) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<MeetScoutTableHeader>(
    headers[headers.length - 1]
  );

  const handleSetOrder = (property: MeetScoutTableHeader) => {
    const isAsc = orderBy.id === property.id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedAthletes = useMemo(() => {
    return athletes.slice().sort((a, b) => {
      const aColumn = a[orderBy.id];
      const bColumn = b[orderBy.id];
      if (aColumn === undefined && bColumn === undefined) {
        return 0; // Both have no value, maintain original order
      }
      if (aColumn === undefined) {
        return 1; // Only a doesn't have value, so it should come later
      }
      if (bColumn === undefined) {
        return -1; // Only b doesn't have value, so it should come later
      }
      if (typeof aColumn == 'string' && typeof bColumn == 'string') {
        return aColumn.localeCompare(bColumn) * (order === 'asc' ? -1 : 1);
      } else if (typeof aColumn == 'number' && typeof bColumn == 'number') {
        return (bColumn - aColumn) * (order === 'asc' ? -1 : 1);
      } else {
        return 0;
      }
    });
  }, [order, orderBy, athletes]);

  return (
    <Container className='px-1 mt-5 mb-3'>
      <ThemeProvider theme={darkTheme}>
        <TableContainer sx={{ borderRadius: '20px' }} component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell className='font-jockey'>Rank</TableCell>
                {headers.map((header, index) => (
                  <TableCell
                    className='font-jockey'
                    key={header + index.toString()}
                    sortDirection={orderBy.id === header.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy.id === header.id}
                      direction={orderBy.id === header.id ? order : 'asc'}
                      onClick={() => handleSetOrder(header)}
                    >
                      {header.name}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAthletes.map((athlete, index) => (
                <MeetScoutTableRow
                  key={athlete.openPowerliftingId + index.toString()}
                  athlete={athlete}
                  columns={headers.map((header) => header.id)}
                  rank={index + 1}
                  handleEditAthleteData={handleEditAthleteData}
                ></MeetScoutTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>
    </Container>
  );
};

export default MeetScoutTable;
