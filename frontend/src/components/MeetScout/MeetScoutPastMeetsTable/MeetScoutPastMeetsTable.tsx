import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
} from '@mui/material';
import {
  MeetScoutPastMeet,
  MeetScoutPastMeetsTableProps,
} from '../../../types/meetScoutTypes';
import { convertToLBS } from '../../../convertToUnits';
import { useUnitContext } from '../../../hooks/context';

const tableHeaders = [
  'Date',
  'Weight Class',
  'Age',
  'Equipment',
  'Best Squat',
  'Best Bench',
  'Best Deadlift',
  'Total',
  'Dots',
];

const MeetScoutPastMeetsTable = ({
  openPowerliftingId,
  pastMeets,
}: MeetScoutPastMeetsTableProps) => {
  const units = useUnitContext();

  const renderPastMeetCell = (
    value: MeetScoutPastMeet[keyof MeetScoutPastMeet],
    convertibleToLBS: boolean = false
  ) => (
    <TableCell className='font-jockey'>
      {units.isLBS && convertibleToLBS ? convertToLBS(value) : value.toString()}
    </TableCell>
  );

  return (
    <Table size='small'>
      <TableHead>
        <TableRow>
          {tableHeaders.map((header) => (
            <TableCell key={header} className='font-jockey'>
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {pastMeets.map((pastMeet) => (
          <TableRow key={openPowerliftingId + JSON.stringify(pastMeet)}>
            {renderPastMeetCell(pastMeet.date)}
            {renderPastMeetCell(pastMeet.weightClass, true)}
            {renderPastMeetCell(pastMeet.age)}
            {renderPastMeetCell(pastMeet.equipment)}
            {renderPastMeetCell(pastMeet.bestSquat, true)}
            {renderPastMeetCell(pastMeet.bestBench, true)}
            {renderPastMeetCell(pastMeet.bestDeadlift, true)}
            {renderPastMeetCell(pastMeet.total, true)}
            {renderPastMeetCell(pastMeet.dots)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MeetScoutPastMeetsTable;
