import React from 'react';
import './Content.scss';
import { Route, Routes } from 'react-router-dom';
import About from '../../pages/About.jsx';
import Converter from '../Converter/Converter.jsx';
import Encyclopedia from '../../pages/Encyclopedia.jsx';
import Training from '../../pages/Trainings.jsx';
import PatrolList from '../Competition/PatrolList/PatrolList.jsx';
import UserPage from '../Competition/UserPage/UserPage.jsx';
import SignIn from '../SignIn/SignIn.jsx';
import SignUp from '../SignUp/SignUp.jsx';
import Profile from '../Profile/Profile.jsx';
import Competition from '../Competition/Competition.jsx';
import CompetitionsList
  from '../Competition/CompetitionsList/CompetitionsList.jsx';
import Achievements from '../Achievments/Achievements.jsx';
import Settings from '../Settings/Settings.jsx';

function Content() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Converter />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

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
