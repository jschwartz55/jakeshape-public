import { useEffect, useState } from 'react';
import MeetScoutForm from '../forms/MeetScoutForm/MeetScoutForm';
import { Container, Spinner } from 'react-bootstrap';
import { getMeetScoutingReport } from '../api/getMeetScoutingReport';
import {
  HandleEditAthleteData,
  HandleSetAthleteData,
  MeetScoutAthlete,
  MeetScoutData,
  MeetScoutFormValues,
} from '../types/meetScoutTypes';
import { MeetScoutTable } from '../components/MeetScout';
import { editMeetScoutingReport } from '../api/editMeetScoutingReport';
import { ToolPageHeader } from '../components/Tools';
import ToolCard from '../components/Tools/ToolCard/ToolCard';
import { displayErrorMessage } from '../api/displayErrorMessage';

const MeetScoutPage = () => {
  const [meetScoutData, setMeetScoutData] = useState<MeetScoutData | null>(
    null
  );
  const [loadingMeetScoutData, setLoadingMeetScoutData] =
    useState<boolean>(false);
  const [errorMeetScoutData, setErrorMeetScoutData] = useState<string | null>(
    null
  );

  const handleSetMeetScoutData: HandleSetAthleteData = async (
    data: MeetScoutFormValues
  ) => {
    if (meetScoutData) {
      setMeetScoutData(null);
    }
    setErrorMeetScoutData(null);
    setLoadingMeetScoutData(true);
    try {
      const response = await getMeetScoutingReport(data);
      setMeetScoutData(response);
    } catch (error) {
      displayErrorMessage(error, setErrorMeetScoutData);
    }
    setLoadingMeetScoutData(false);
  };

  const validateEditAthleteDataInput = (newOpenPowerliftingId: string) => {
    if (
      !/^[a-z]+\d*$/.test(newOpenPowerliftingId) ||
      !(newOpenPowerliftingId.length <= 200) ||
      meetScoutData === null
    ) {
      throw new Error('Error: Invalid input');
    }
    if (
      meetScoutData?.athletes.some(
        (athlete) => athlete.openPowerliftingId === newOpenPowerliftingId
      )
    ) {
      throw new Error(
        'Error: Athlete with ID ' +
          newOpenPowerliftingId +
          ' is already in the table.'
      );
    }
  };

  const handleEditAthleteData: HandleEditAthleteData = async (
    oldOpenPowerliftingId: string,
    newOpenPowerliftingId: string,
    weightClass: string,
    equipment: string
  ) => {
    validateEditAthleteDataInput(newOpenPowerliftingId);

    const response = await editMeetScoutingReport(
      newOpenPowerliftingId,
      weightClass,
      equipment,
      (meetScoutData as MeetScoutData).meetDate
    );

    if (response.errorType === null) {
      setMeetScoutData((prevMeetScoutData) => {
        if (!prevMeetScoutData) return null;

        const updatedAthletes: MeetScoutAthlete[] =
          prevMeetScoutData.athletes.map((athlete) => {
            if (athlete.openPowerliftingId === oldOpenPowerliftingId) {
              return {
                ...athlete,
                ...response,
              };
            }
            return athlete;
          });

        return {
          ...prevMeetScoutData,
          athletes: updatedAthletes,
        };
      });
    } else {
      throw new Error('Error: ' + response.message);
    }
  };

  useEffect(() => {
    if (loadingMeetScoutData) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [loadingMeetScoutData]);

  return (
    <ToolCard>
      <ToolPageHeader title='Meet Scout' />
      <p className='mx-3 font-jockey'>
        Meet Scout enables you to analyze your competition ahead of your
        upcoming powerlifting event. Simply input the LiftingCast meet ID
        corresponding to your upcoming competition, and you'll gain access to
        forecasts for the upcoming meet as well as historical performances from
        previous competitions. If the LiftingCast page URL is in the format
        https://liftingcast.com/meets/mh7e9tmpxq0n/results, you only need to
        enter the mh7e9tmpxq0n portion. It's important to note that LiftingCast
        results could have a delay of up to 7 days, and data from past meets is
        refreshed on a monthly basis.
      </p>
      <MeetScoutForm
        handleSetMeetScoutData={handleSetMeetScoutData}
        loadingMeetScoutData={loadingMeetScoutData}
      />
      {loadingMeetScoutData && (
        <Container className='d-flex justify-content-center mt-3 mb-5'>
          <Spinner animation='grow' variant='light' />
        </Container>
      )}
      {meetScoutData && (
        <Container className='font-jockey'>
          <h1 className='text-center mt-3 mb-4'>
            {meetScoutData.meetName + ' ' + meetScoutData.meetDate}
          </h1>
          <MeetScoutTable
            athletes={meetScoutData.athletes}
            handleEditAthleteData={handleEditAthleteData}
          />
        </Container>
      )}
      {errorMeetScoutData && (
        <Container className='d-flex justify-content-center mt-3 mb-5 font-jockey'>
          <div>{errorMeetScoutData}</div>
        </Container>
      )}
    </ToolCard>
  );
};
export default MeetScoutPage;
