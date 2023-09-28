import { Routes, Route } from 'react-router-dom';
import {
  NotFoundPage,
  HomePage,
  MeetScoutPage,
  PerformancePredictorPage,
  PowerPercentilePage,
  ContactPage,
  AboutPage,
  WeightWhizPage,
} from './pages';
import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <>
      <Sidebar />
      <Routes>
        <Route path='*' element={<NotFoundPage />} />
        <Route path='/' element={<HomePage />} />
        <Route path='meet-scout' element={<MeetScoutPage />} />
        <Route
          path='performance-predictor'
          element={<PerformancePredictorPage />}
        />
        <Route path='power-percentile' element={<PowerPercentilePage />} />
        <Route path='weight-whiz' element={<WeightWhizPage />} />
        <Route path='contact' element={<ContactPage />} />
        <Route path='about' element={<AboutPage />} />
      </Routes>
    </>
  );
}

export default App;
