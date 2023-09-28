import { MeetScoutFormInitialValues } from '../forms/MeetScoutForm/MeetScoutForm';

export type MeetScoutPastMeet = {
  age: number;
  bestBench: number;
  bestDeadlift: number;
  bestSquat: number;
  bodyweight: number;
  date: string;
  dots: number;
  equipment: string;
  weightClass: string;
  total: number;
};

export type MeetScoutAthlete = {
  age: number;
  bench: number;
  bodyweight: number;
  dataFound: boolean;
  deadlift: number;
  dots: number;
  equipment: string;
  name: string;
  openPowerliftingId: string;
  pastMeets: MeetScoutPastMeet[];
  sex: string;
  squat: number;
  total: number;
  weightClass: string;
  message: string;
  errorType: string;
};

export type MeetScoutData = {
  meetName: string;
  meetDate: string;
  athletes: MeetScoutAthlete[];
};

export type MeetScoutTableHeader = {
  name: string;
  id: keyof MeetScoutAthlete;
};

export type MeetScoutAthleteTableProps = {
  priorMeets: MeetScoutPastMeet[];
};

export type HandleEditAthleteData = (
  oldOpenPowerliftingId: string,
  newOpenPowerliftingId: string,
  weightClass: string,
  equipment: string
) => Promise<void>;

export type HandleSetAthleteData = (data: MeetScoutFormValues) => Promise<void>;

export type MeetScoutFormValues = {
  meetID: string;
};

export type MeetScoutTableProps = {
  athletes: MeetScoutAthlete[];
  handleEditAthleteData: HandleEditAthleteData;
};

export type MeetScoutTableRowProps = {
  athlete: MeetScoutAthlete;
  columns: (keyof MeetScoutAthlete)[];
  rank: number;
  handleEditAthleteData: HandleEditAthleteData;
};

export type MeetScoutPastMeetsTableProps = {
  openPowerliftingId: string;
  pastMeets: MeetScoutPastMeet[];
};

export type MeetScoutEditAthleteInputProps = {
  errorType: string;
  message: string;
  openPowerliftingId: string;
  name: string;
  weightClass: string;
  equipment: string;
  handleEditAthleteData: HandleEditAthleteData;
};

export type MeetScoutFormProps = {
  handleSetMeetScoutData: (data: MeetScoutFormValues) => void;
  loadingMeetScoutData: boolean;
};
