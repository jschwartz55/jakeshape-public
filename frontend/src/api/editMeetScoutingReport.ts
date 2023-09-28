import { API } from 'aws-amplify';
import { MeetScoutAthlete } from '../types/meetScoutTypes';

export const editMeetScoutingReport = async (
  openPowerliftingId: string,
  weightClass: string,
  equipment: string,
  meetDate: string
): Promise<MeetScoutAthlete> => {
  const response = await API.get(
    'jakeshapeAPI',
    '/api/edit-meet-scouting-report',
    {
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
      },
      queryStringParameters: {
        openPowerliftingId: openPowerliftingId,
        weightClass: weightClass,
        equipment: equipment,
        meetDate: meetDate,
      },
    }
  );
  return response;
};
