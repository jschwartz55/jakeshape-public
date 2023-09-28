import { CircleProps } from '../../types/circleTypes';

const Circle = ({ color, width }: CircleProps) => {
  const circleStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${width}px`,
    borderRadius: '50%',
    backgroundColor: color,
  };

  return <div style={circleStyle}></div>;
};

export default Circle;
