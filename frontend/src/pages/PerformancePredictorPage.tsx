import { Container, Spinner } from 'react-bootstrap';
import PerformancePredictorForm from '../forms/PerformancePredictorForm/PerformancePredictorForm';
import { getPerformancePrediction } from '../api/getPerformancePrediction';
import { useEffect, useState } from 'react';
import {
  PerformancePrediction,
  PerformancePredictorFormValues,
} from '../types/performancePredictorTypes';
import { ToolPageHeader } from '../components/Tools';
import ToolCard from '../components/Tools/ToolCard/ToolCard';
import { displayErrorMessage } from '../api/displayErrorMessage';
import { PerformancePredictorResults } from '../components/PerformancePredictor';

const PerformancePredictorPage = () => {
  const [loadingPerformancePrediction, setLoadingPerformancePrediction] =
    useState<boolean>(false);
  const [performancePrediction, setPerformancePrediction] =
    useState<PerformancePrediction | null>(null);
  const [errorPerformancePrediction, setErrorPerformancePrediction] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (loadingPerformancePrediction) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [loadingPerformancePrediction]);

  const handleFormSubmit = async (
    data: PerformancePredictorFormValues
  ): Promise<void> => {
    setPerformancePrediction(null);
    setErrorPerformancePrediction(null);
    setLoadingPerformancePrediction(true);
    try {
      const response = await getPerformancePrediction(data);
      setPerformancePrediction(response);
    } catch (error) {
      displayErrorMessage(error, setErrorPerformancePrediction);
    }
    setLoadingPerformancePrediction(false);
  };

  return (
    <ToolCard>
      <ToolPageHeader title='Performance Predictor' />
      <p className='mx-3 font-jockey'>
        This tool utilizes machine learning to project your performance in your
        upcoming powerlifting meet, based on your past meet results. However, it
        is important to note that it is designed for individuals with previous
        competition experience and does not offer predictions for first-time
        competitors. Your OpenPowerlifting ID is the name at the end of the URL
        for your page. For example, jacobschwartz1 is the name you would input
        from the url openpowerlifting.org/u/jacobschwartz1.
      </p>
      <PerformancePredictorForm
        handleFormSubmit={handleFormSubmit}
        loadingPerformancePrediction={loadingPerformancePrediction}
      />
      {loadingPerformancePrediction ? (
        <Container className='d-flex justify-content-center mt-3 mb-5'>
          <Spinner animation='grow' variant='light' />
        </Container>
      ) : null}
      {performancePrediction ? (
        <PerformancePredictorResults
          performancePrediction={performancePrediction}
        />
      ) : null}
      {errorPerformancePrediction ? (
        <Container className='d-flex justify-content-center mt-3 mb-5 font-jockey'>
          <div>{errorPerformancePrediction}</div>
        </Container>
      ) : null}
    </ToolCard>
  );
};

export default PerformancePredictorPage;
