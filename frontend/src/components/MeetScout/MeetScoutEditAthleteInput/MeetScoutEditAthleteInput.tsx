import { Button, FormControl, InputGroup, Spinner } from 'react-bootstrap';
import { MeetScoutEditAthleteInputProps } from '../../../types/meetScoutTypes';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { displayErrorMessage } from '../../../api/displayErrorMessage';

const MeetScoutEditAthleteInput = ({
  errorType,
  message,
  openPowerliftingId,
  name,
  weightClass,
  equipment,
  handleEditAthleteData,
}: MeetScoutEditAthleteInputProps) => {
  const [loadingEditAthleteData, setLoadingEditAthleteData] =
    useState<boolean>(false);
  const [newOpenPowerliftingId, setNewOpenPowerliftingId] =
    useState<string>('');
  const [errorEditMeetScoutData, setErrorEditMeetScoutData] = useState<
    string | null
  >(null);

  const handleEdit = async () => {
    setLoadingEditAthleteData(true);
    setErrorEditMeetScoutData(null);

    try {
      await handleEditAthleteData(
        openPowerliftingId,
        newOpenPowerliftingId,
        weightClass,
        equipment
      );
    } catch (error) {
      displayErrorMessage(error, setErrorEditMeetScoutData);
    }

    setLoadingEditAthleteData(false);
  };

  useEffect(() => {
    if (errorEditMeetScoutData) {
      const timerId = setTimeout(() => {
        setErrorEditMeetScoutData(null);
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [errorEditMeetScoutData]);

  return (
    <>
      {errorType !== null && (
        <Typography
          className='font-jockey'
          variant='h6'
          component='div'
          gutterBottom
        >
          {message}
        </Typography>
      )}

      {errorType !== 'NA' && (
        <p className='font-jockey'>
          {errorType === 'DIS' ? (
            <>
              {'Visit '}
              <a
                className='meet-scout-link-white'
                href={
                  'https://www.openpowerlifting.org/u/' + openPowerliftingId
                }
                target='_blank'
                rel='noopener noreferrer'
              >
                {'https://www.openpowerlifting.org/u/' + openPowerliftingId}
              </a>{' '}
              to see all lifters who share the name {name}. Then, input the
              correct ID.{' '}
            </>
          ) : errorType === 'MIS' ? (
            <>
              Athlete has never competed or LiftingCast name does not match
              OpenPowerlifting name. Input OpenPowerlifting ID if known.
            </>
          ) : (
            errorType === 'DAT' && (
              <>Input correct OpenPowerlifting ID if known.</>
            )
          )}
        </p>
      )}
      <InputGroup size='sm' className='mb-3 mt-3 small-input'>
        <FormControl
          value={newOpenPowerliftingId}
          onChange={(e) => setNewOpenPowerliftingId(e.target.value)}
          className='font-jockey'
          placeholder={
            errorType === null
              ? 'Change ID for ' + name + '. ex: ' + openPowerliftingId
              : 'Enter correct ID for ' +
                name +
                '. ex: ' +
                openPowerliftingId +
                '1'
          }
        />
        <Button
          className='green-button'
          type='submit'
          disabled={loadingEditAthleteData}
          onClick={handleEdit}
        >
          {loadingEditAthleteData ? (
            <>
              <Spinner
                as='span'
                animation='border'
                size='sm'
                role='status'
                className='me-2'
              />
              <span>SUBMIT</span>
            </>
          ) : (
            'SUBMIT'
          )}
        </Button>
      </InputGroup>
      {errorEditMeetScoutData && (
        <p className='mt-0 font-jockey text-danger'>{errorEditMeetScoutData}</p>
      )}
    </>
  );
};
export default MeetScoutEditAthleteInput;
