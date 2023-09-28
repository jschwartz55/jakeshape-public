import { Container } from 'react-bootstrap';
import Circle from '../../Circle/Circle';

const getWeightOption = (color: string, weight: string) => {
  return {
    color: color,
    weight: weight,
  };
};

const weightOptions = [
  getWeightOption('#E84949', '25'),
  getWeightOption('#4959E8', '20'),
  getWeightOption('#E4E849', '15'),
  getWeightOption('#49E850', '10'),
  getWeightOption('#FFFFFF', '5'),
  getWeightOption('#363636', '2.5'),
  getWeightOption('#CACACA', '1.25'),
];

const WeightWhizWeightOptionDisplay = () => {
  return (
    <Container className='d-flex justify-content-center my-5'>
      {weightOptions.map((weightOption) => (
        <Container
          className='d-flex flex-column align-items-center'
          key={weightOption.weight}
        >
          <Circle color={weightOption.color} width={14} />
          <p className='font-jockey'>{weightOption.weight}</p>
        </Container>
      ))}
    </Container>
  );
};

export default WeightWhizWeightOptionDisplay;
