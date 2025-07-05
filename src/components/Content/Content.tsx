import './Content.scss';
import { Route, Routes } from 'react-router-dom';
import About from '../../pages/About.tsx';
import Converter from '../Converter/Converter.tsx';
import Encyclopedia from '../../pages/Encyclopedia.tsx';
import Training from '../../pages/Trainings.tsx';
import PatrolList from '../Competition/PatrolList/PatrolList.tsx';
import UserPage from '../Competition/UserPage/UserPage.tsx';
import SignIn from '../SignIn/SignIn.tsx';
import SignUp from '../SignUp/SignUp.tsx';
import Profile from '../Profile/Profile.tsx';
import Competition from '../Competition/Competition.tsx';
import CompetitionsList
  from '../Competition/CompetitionsList/CompetitionsList.tsx';
import Achievements from '../Achievments/Achievements.tsx';
import Settings from '../Settings/Settings.tsx';
import GoogleCallback from '../GoogleCallback/GoogleCallback.tsx';

function Content() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Converter />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/converter" element={<Converter />} />
        <Route path="/competitions" element={<CompetitionsList />} />
        <Route path="/competition" element={<Competition />} />
        <Route path="/competition/patrols" element={<PatrolList />} />
        <Route path="/competition/user" element={<UserPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/encyclopedia" element={<Encyclopedia />} />
        <Route path="/trainings" element={<Training />} />
      </Routes>
    </main>
  );
}

export default Content;
