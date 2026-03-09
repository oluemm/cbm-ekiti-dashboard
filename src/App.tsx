import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardShell } from '@/components/layout';
import Overview from '@/pages/Overview';
import ElectionResults from '@/pages/ElectionResults';
import VotingPattern from '@/pages/VotingPattern';
import SecurityLogistics from '@/pages/SecurityLogistics';
import PVCAnalysis from '@/pages/PVCAnalysis';
import Collation from '@/pages/Collation';
import PollingUnits from '@/pages/PollingUnits';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardShell />}>
          <Route index element={<Overview />} />
          <Route path="results" element={<ElectionResults />} />
          <Route path="voting-pattern" element={<VotingPattern />} />
          <Route path="security" element={<SecurityLogistics />} />
          <Route path="pvc" element={<PVCAnalysis />} />
          <Route path="collation" element={<Collation />} />
          <Route path="polling-units" element={<PollingUnits />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
