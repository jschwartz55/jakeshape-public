import { Col, Row } from 'react-bootstrap';
import { convertToLBS } from '../../../convertToUnits';
import { useUnitContext } from '../../../hooks/context';
import { PerformancePredictorResultsProps } from '../../../types/performancePredictorTypes';
import { ShareButton } from '../../ShareButton';

const PerformancePredictorResults = ({
  performancePrediction,
}: PerformancePredictorResultsProps) => {
  const units = useUnitContext();

  const shareMessage =
    'Check out my predicted powerlifting performance on https://jakeshape.com/performance-predictor!\n\n' +
    'Squat: ' +
    (units.isLBS
      ? convertToLBS(performancePrediction.squat) + ' LBS'
      : performancePrediction.squat + ' KG') +
    '\n' +
    'Bench: ' +
    (units.isLBS
      ? convertToLBS(performancePrediction.bench) + ' LBS'
      : performancePrediction.bench + ' KG') +
    '\n' +
    'Deadlift: ' +
    (units.isLBS
      ? convertToLBS(performancePrediction.deadlift) + ' LBS'
      : performancePrediction.deadlift + ' KG');

  const renderPredictionColumn = (name: string, value: number) => (
    <Col>
      <Row>
        <h2>{name}</h2>
      </Row>
      <Row>
        <h2>{units.isLBS ? convertToLBS(value) : value}</h2>
      </Row>
    </Col>
  );

  return (
    <Row className='font-jockey text-center mb-3'>
      <ShareButton shareMessage={shareMessage} />
      {renderPredictionColumn('Squat', performancePrediction.squat)}
      {renderPredictionColumn('Bench', performancePrediction.bench)}
      {renderPredictionColumn('Deadlift', performancePrediction.deadlift)}
    </Row>
  );
};

export default PerformancePredictorResults;
