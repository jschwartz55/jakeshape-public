import { Container } from 'react-bootstrap';
import { ToolCard, ToolPageHeader } from '../components/Tools';
import {
  WeightWhizGameScreen,
  WeightWhizWeightOptionDisplay,
  WeightWhizLeaderboards,
} from '../components/WeightWhiz';

const WeightWhizPage = () => {
  return (
    <ToolCard>
      <ToolPageHeader title='Weight Whiz' showUnitToggle={false} />
      <p className='mx-3 font-jockey'>
        You have 60 seconds to guess the weight in pounds of as many loaded bars
        as you can. Enter the weight to the nearest whole number. A variance of
        1 LB will be accepted. For example, if three red plates are loaded on a
        45LB bar, 374 or 375 will be accepted. The graphic will only show one
        side of the bar, but you must guess the weight of the entire loaded bar.
        You can assume the bar was loaded symmetrically.
      </p>
      <Container className='mx-1'>
        <WeightWhizGameScreen />
        <WeightWhizWeightOptionDisplay />
      </Container>
      <WeightWhizLeaderboards />
    </ToolCard>
  );
};

export default WeightWhizPage;
