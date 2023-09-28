import { API } from 'aws-amplify';
import {
  PowerPercentile,
  PowerPercentileFormValues,
} from '../types/powerPercentile';

export const getPowerPercentile = async ({
  sexInclude,
  equipmentInclude,
  ageRange,
  bodyweightRange,
  federationInclude,
  dateRange,
  squat,
  bench,
  deadlift,
  total,
}: PowerPercentileFormValues): Promise<PowerPercentile> => {
  const response = await API.post('jakeshapeAPI', '/api/get-power-percentile', {
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY,
    },
    body: {
      sexInclude: sexInclude,
      equipmentInclude: equipmentInclude,
      ageRange: ageRange,
      bodyweightRange: bodyweightRange,
      federationInclude: federationInclude,
      dateRange: dateRange,
      squat: squat,
      bench: bench,
      deadlift: deadlift,
      total: total,
    },
  });
  return response;
};
