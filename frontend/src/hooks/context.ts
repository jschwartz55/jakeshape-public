import { createContext, useContext } from 'react';

type Units = {
  isLBS: boolean;
  switchUnits: () => void;
};

export const UnitContext = createContext<Units | undefined>(undefined);

export const useUnitContext = () => {
  const units = useContext(UnitContext);

  if (units === undefined) {
    throw new Error('useUnitContext must be used within a UnitContext');
  }

  return units;
};
