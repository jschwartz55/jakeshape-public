import { useState, useEffect } from 'react';
import { displayErrorMessage } from '../api/displayErrorMessage';
import { getPowerPercentile } from '../api/getPowerPercentile';
import { ToolCard, ToolPageHeader } from '../components/Tools';
import { PowerPercentileForm } from '../forms';
import {
  PowerPercentile,
  PowerPercentileFormValues,
} from '../types/powerPercentile';
import { Container, Spinner } from 'react-bootstrap';
import { PowerPercentileResults } from '../components/PowerPercentile';

const PowerPercentilePage = () => {
  const [loadingPowerPercentile, setLoadingPowerPercentile] =
    useState<boolean>(false);
  const [powerPercentile, setPowerPercentile] =
    useState<PowerPercentile | null>(null);
  const [errorPowerPercentile, setErrorPowerPercentile] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (loadingPowerPercentile) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [loadingPowerPercentile]);

  const handleFormSubmit = async (
    data: PowerPercentileFormValues
  ): Promise<void> => {
    setPowerPercentile(null);
    setErrorPowerPercentile(null);
    setLoadingPowerPercentile(true);
    try {
      const response = await getPowerPercentile(data);
      setPowerPercentile(response);
    } catch (error) {
      displayErrorMessage(error, setErrorPowerPercentile);
    }
    setLoadingPowerPercentile(false);
  };
  return (
    <ToolCard>
      <ToolPageHeader title='Power Percentile' />
      <p className='mx-3 font-jockey'>
        This tool allows you to see how your powerlifting numbers stack up
        against your competitors. Filter the data and input your best lifts to
        see what percentage of powerlifters you surpass or match in strength.
        All filters are inclusive so if you filter for a bodyweight range
        between 67.5 and 75 kgs, it will encompass athletes weighing both 67.5
        kgs and 75 kgs. Data is refreshed monthly.
      </p>
      <PowerPercentileForm
        handleFormSubmit={handleFormSubmit}
        loadingPowerPercentile={loadingPowerPercentile}
      />
      {loadingPowerPercentile && (
        <Container className='d-flex justify-content-center mt-3 mb-5'>
          <Spinner animation='grow' variant='light' />
        </Container>
      )}
      {powerPercentile && (
        <PowerPercentileResults powerPercentile={powerPercentile} />
      )}
      {errorPowerPercentile && (
        <Container className='d-flex justify-content-center mt-3 mb-5 font-jockey'>
          <div>{errorPowerPercentile}</div>
        </Container>
      )}
    </ToolCard>
  );
};

export default PowerPercentilePage;
