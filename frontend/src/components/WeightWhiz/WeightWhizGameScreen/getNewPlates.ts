import { GameMode, Plates } from '../../../types/weightWhizTypes';

const defaultPlateOptions = [25, 20, 15, 10, 5, 2.5, 1.25];
const easyPlateOptions = [25, 20, 15, 10, 5];

const maxPlateCounts: Record<number, number> = {
  25: 4,
  20: 2,
  15: 2,
  10: 2,
  5: 2,
  2.5: 2,
  1.25: 2,
};

const coeff = 2.20462;

const findMinimumPlates = (
  targetWeight: number,
  plateOptions: number[] = defaultPlateOptions
): number[] => {
  const usedPlates: number[] = [];
  for (const plateOption of plateOptions) {
    while (targetWeight >= plateOption) {
      usedPlates.push(plateOption);
      targetWeight -= plateOption;
    }
  }

  return usedPlates;
};

const shufflePlates = (array: number[]): number[] => {
  const shuffledPlates = [...array];

  for (let i = shuffledPlates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = shuffledPlates[i];
    shuffledPlates[i] = shuffledPlates[j];
    shuffledPlates[j] = temp;
  }

  return shuffledPlates;
};

const findRandomPlates = (
  shuffle: boolean,
  barbellWeightKg: number,
  includeClip: boolean
): Plates => {
  const plates: number[] = [];

  let totalKg: number = 0;

  defaultPlateOptions.forEach((plateOption) => {
    const maxPlateCount = maxPlateCounts[plateOption];
    if (maxPlateCount !== undefined) {
      const randomPlateCount = Math.floor(Math.random() * (maxPlateCount + 1));
      for (let i = 0; i < randomPlateCount; i++) {
        plates.push(plateOption);
        totalKg += plateOption;
      }
    }
  });

  if (includeClip) {
    totalKg += 2.5;
  }

  return {
    totalLowerLBS: Math.floor((totalKg * 2 + barbellWeightKg) * coeff),
    plates: shuffle ? shufflePlates(plates) : plates.reverse(),
  };
};

const getTotalKg = (
  maxTotal: number,
  minDenomination: number = 1.25
): number => {
  const randomTotal =
    Math.random() * (maxTotal / minDenomination) * minDenomination;
  return Math.floor(randomTotal / minDenomination) * minDenomination;
};

const getPlatesEasy = (
  barbellWeightKg: number,
  includeClip: boolean
): Plates => {
  let totalKg = getTotalKg(75, 5);
  const plates = findMinimumPlates(totalKg, easyPlateOptions);
  if (includeClip) {
    totalKg += 2.5;
  }
  return {
    totalLowerLBS: Math.floor((totalKg * 2 + barbellWeightKg) * coeff),
    plates: plates.reverse(),
  };
};

const getPlatesNormal = (
  barbellWeightKg: number,
  includeClip: boolean
): Plates => {
  let totalKg = getTotalKg(125);
  const plates = findMinimumPlates(totalKg);
  if (includeClip) {
    totalKg += 2.5;
  }
  return {
    totalLowerLBS: Math.floor((totalKg * 2 + barbellWeightKg) * coeff),
    plates: plates.reverse(),
  };
};

const getPlatesHard = (
  barbellWeightKg: number,
  includeClip: boolean
): Plates => {
  return findRandomPlates(false, barbellWeightKg, includeClip);
};

const getPlatesExpert = (
  BarbellWeightKg: number,
  includeClip: boolean
): Plates => {
  return findRandomPlates(true, BarbellWeightKg, includeClip);
};

export const getNewPlates = (
  gameMode: GameMode,
  barbellWeightKg: number,
  includeClip: boolean
): Plates => {
  switch (gameMode) {
    case 'expert':
      return getPlatesExpert(barbellWeightKg, includeClip);
    case 'hard':
      return getPlatesHard(barbellWeightKg, includeClip);
    case 'easy':
      return getPlatesEasy(barbellWeightKg, includeClip);
    default:
      return getPlatesNormal(barbellWeightKg, includeClip);
  }
};
