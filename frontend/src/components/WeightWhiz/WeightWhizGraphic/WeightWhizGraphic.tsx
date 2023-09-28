import { Container, Image } from 'react-bootstrap';
import { WeightWhizGraphicProps } from '../../../types/weightWhizTypes';

const weightMap: Record<number, string> = {
  25: '25',
  20: '20',
  15: '15',
  10: '10',
  5: '5',
  2.5: '2_5',
  1.25: '1_25',
};
const WeightWhizGraphic = ({ plates, includeClip }: WeightWhizGraphicProps) => {
  return (
    <Container className='d-flex justify-content-center align-items-center my-2'>
      <svg
        height={28}
        aria-label='barbell sleeve'
        viewBox={`0 0 ${181 - (170 / 16) * plates.length} 12`}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <mask id='path-1-inside-1_101_9' fill='white'>
          <path d='M0 3C0 1.34315 1.34315 0 3 0H181V12H3C1.34314 12 0 10.6569 0 9V3Z' />
        </mask>
        <path
          d='M0 3C0 1.34315 1.34315 0 3 0H181V12H3C1.34314 12 0 10.6569 0 9V3Z'
          fill='#D9D9D9'
        />
        <path
          d='M-1 3C-1 0.790861 0.790861 -1 3 -1H181V1H3C1.89543 1 1 1.89543 1 3H-1ZM181 13H3C0.790861 13 -1 11.2091 -1 9H1C1 10.1046 1.89543 11 3 11H181V13ZM3 13C0.790861 13 -1 11.2091 -1 9V3C-1 0.790861 0.790861 -1 3 -1V1C1.89543 1 1 1.89543 1 3V9C1 10.1046 1.89543 11 3 11V13ZM181 0V12V0Z'
          fill='black'
          mask='url(#path-1-inside-1_101_9)'
        />
      </svg>
      {includeClip && (
        <Image
          aria-label='barbell collar'
          src='weightWhiz/clip.svg'
          width={35}
        />
      )}
      {plates.map((plate: number, index: number) => (
        <Image
          aria-label={`${plate}kg plate`}
          key={index}
          src={`weightWhiz/${weightMap[plate]}kg.svg`}
          width={30}
        />
      ))}

      <Image
        aria-label='barbell collar'
        src='weightWhiz/collar.svg'
        width={45}
      />
    </Container>
  );
};

export default WeightWhizGraphic;
