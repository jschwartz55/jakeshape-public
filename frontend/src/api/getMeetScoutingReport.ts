import { API } from 'aws-amplify';
import { MeetScoutData, MeetScoutFormValues } from '../types/meetScoutTypes';

export const getMeetScoutingReport = async (
  data: MeetScoutFormValues
): Promise<MeetScoutData> => {
  let response = await API.get('jakeshapeAPI', '/api/check-meet-scout-cache', {
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY,
    },
    queryStringParameters: {
      liftingCastMeetId: data.meetID,
    },
  });

  if (response == null) {
    response = await API.get(
      'getMeetScoutingReport',
      '/api/get-meet-scouting-report',
      {
        headers: {
          'x-api-key': process.env.REACT_APP_API_KEY,
        },
        queryStringParameters: {
          liftingCastMeetId: data.meetID,
        },
      }
    );
  }
  return response;
};
