import {
  TableRow,
  TableCell,
  IconButton,
  Box,
  Typography,
  Collapse,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';
import {
  MeetScoutTableRowProps,
  MeetScoutAthlete,
} from '../../../types/meetScoutTypes';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled } from '@mui/material/styles';
import { MeetScoutEditAthleteInput, MeetScoutPastMeetsTable } from '..';
import { convertToLBS } from '../../../convertToUnits';
import { useUnitContext } from '../../../hooks/context';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(4n+1), &:nth-of-type(4n+2)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const MeetScoutTableRow = ({
  athlete,
  columns,
  rank,
  handleEditAthleteData,
}: MeetScoutTableRowProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const units = useUnitContext();

  const renderMeetCell = (
    value: MeetScoutAthlete[keyof MeetScoutAthlete],
    convertibleToLBS: boolean = false
  ) => (
    <TableCell className='athlete-table-text font-jockey'>
      {units.isLBS && convertibleToLBS
        ? convertToLBS(value as string)
        : value.toString()}
    </TableCell>
  );

  return (
    <>
      <StyledTableRow
        className={`${
          athlete.dataFound
            ? 'athlete-table-select'
            : 'athlete-table-error-select'
        }`}
      >
        {athlete.dataFound ? (
          <>
            <TableCell>
              <IconButton
                className='arrow-icon'
                size='small'
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </TableCell>
            <TableCell className='athlete-table-text font-jockey'>
              {rank}
            </TableCell>
            {renderMeetCell(athlete.name)}
            {renderMeetCell(athlete.weightClass, true)}
            {renderMeetCell(athlete.sex)}
            {renderMeetCell(athlete.age)}
            {renderMeetCell(athlete.equipment)}
            {renderMeetCell(athlete.bodyweight, true)}
            {renderMeetCell(athlete.squat, true)}
            {renderMeetCell(athlete.bench, true)}
            {renderMeetCell(athlete.deadlift, true)}
            {renderMeetCell(athlete.total, true)}
            {renderMeetCell(athlete.dots)}
          </>
        ) : (
          <>
            <TableCell>
              <IconButton
                className='arrow-icon text-danger'
                size='small'
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </TableCell>
            <TableCell className='font-jockey text-danger'>X</TableCell>
            <TableCell className='font-jockey text-danger'>
              {athlete.name}
            </TableCell>
            <TableCell
              className='font-jockey text-danger'
              colSpan={columns.length - 1}
            >
              {athlete.weightClass}
            </TableCell>
          </>
        )}
      </StyledTableRow>
      <StyledTableRow>
        <TableCell className='py-0' colSpan={columns.length + 2}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ m: 1 }}>
              {!!athlete.pastMeets && (
                <>
                  <Typography
                    className='font-jockey'
                    variant='h6'
                    component='div'
                  >
                    Past Meets
                    <Tooltip
                      title='See OpenPowerlifting Page'
                      placement='right-start'
                    >
                      <IconButton
                        sx={{ mb: 2 }}
                        className='icon-link'
                        size='small'
                        onClick={() =>
                          window.open(
                            'https://www.openpowerlifting.org/u/' +
                              athlete.openPowerliftingId,
                            '_blank'
                          )
                        }
                      >
                        <OpenInNewIcon sx={{ width: 14, height: 14 }} />{' '}
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <MeetScoutPastMeetsTable
                    openPowerliftingId={athlete.openPowerliftingId}
                    pastMeets={athlete.pastMeets}
                  />
                </>
              )}
              <MeetScoutEditAthleteInput
                errorType={athlete.errorType}
                message={athlete.message}
                openPowerliftingId={athlete.openPowerliftingId}
                name={athlete.name}
                weightClass={athlete.weightClass}
                equipment={athlete.equipment}
                handleEditAthleteData={handleEditAthleteData}
              />
            </Box>
          </Collapse>
        </TableCell>
      </StyledTableRow>
    </>
  );
};

export default MeetScoutTableRow;
