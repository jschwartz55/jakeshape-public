import { Col, Row } from 'react-bootstrap';
import { PowerPercentileResultsProps } from '../../../types/powerPercentile';
import { ShareButton } from '../../ShareButton';

const PowerPercentileResults = ({
  powerPercentile,
}: PowerPercentileResultsProps) => {
  const shareMessage =
    'Check out my strength percentiles on https://jakeshape.com/power-percentile!\n\n' +
    'Squat: ' +
    (powerPercentile.squat * 100).toFixed(2) +
    '%\n' +
    'Bench: ' +
    (powerPercentile.bench * 100).toFixed(2) +
    '%\n' +
    'Deadlift: ' +
    (powerPercentile.deadlift * 100).toFixed(2) +
    '%\n' +
    'Total: ' +
    (powerPercentile.total * 100).toFixed(2) +
    '%\n';

  const renderPredictionColumn = (name: string, value: number) => (
    <Col>
      <Row>
        <h2>{name}</h2>
      </Row>
      <Row>
        <h2>{(value * 100).toFixed(2)}%</h2>
      </Row>
    </Col>
  );

  return (
    <Row className='font-jockey text-center mb-3 mx-2'>
      <ShareButton shareMessage={shareMessage} />
      {renderPredictionColumn('Squat', powerPercentile.squat)}
      {renderPredictionColumn('Bench', powerPercentile.bench)}
      {renderPredictionColumn('Deadlift', powerPercentile.deadlift)}
      {renderPredictionColumn('Total', powerPercentile.total)}
    </Row>
  );
};

export default PowerPercentileResults;
