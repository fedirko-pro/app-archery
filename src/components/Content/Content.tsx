import './Content.scss';

import { Route, Routes } from 'react-router-dom';

import About from '../../pages/About';
import Achievements from '../../pages/achievements/achievements';
import AdminPanel from '../../pages/admin/admin-panel';
import ProtectedAdminRoute from '../../pages/admin/protected-admin-route';
import UserEdit from '../../pages/admin/user-edit/user-edit';
import UserProfileView from '../../pages/admin/user-profile-view/user-profile-view';
import Competition from '../../pages/competition/competition';
import CompetitionsList from '../../pages/competition/competitions-list/competitions-list';
import PatrolList from '../../pages/competition/patrol-list/patrol-list';
import UserPage from '../../pages/competition/user-page/user-page';
import Converter from '../../pages/converter/converter';
import Encyclopedia from '../../pages/Encyclopedia';
// TODO: Settings temporarily disabled - functionality moved to Profile
// import Settings from '../Settings/Settings.tsx';
import GoogleCallback from '../../pages/google-callback/google-callback';
import Profile from '../../pages/profile/profile';
import ProfileEditPage from '../../pages/profile/profile-edit-page';
import ProtectedRoute from '../../pages/protected-route';
import ResetPassword from '../../pages/reset-password/reset-password';
import SignIn from '../../pages/sign-in/sign-in';
import SignUp from '../../pages/sign-up/sign-up';
import AdminApplications from '../../pages/tournament/admin-applications/admin-applications';
import PublicApplication from '../../pages/tournament/public-application/public-application';
import TournamentList from '../../pages/tournament/tournament-list/tournament-list';
import UserApplications from '../../pages/tournament/user-applications/user-applications';
import Training from '../../pages/Trainings';

function Content() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Converter />} /> // todo: main page different for users and admins
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="/achievements" element={<Achievements />} />
        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/profile"
          element={
            <ProtectedAdminRoute>
              <UserProfileView />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId/edit"
          element={
            <ProtectedAdminRoute>
              <UserEdit />
            </ProtectedAdminRoute>
          }
        />
        {/* TODO: Settings route temporarily disabled - functionality moved to Profile */}
        {/* <Route path="/settings" element={<Settings />} /> */}
        <Route path="/converter" element={<Converter />} />
        <Route path="/competitions" element={<CompetitionsList />} />
        <Route path="/competition" element={<Competition />} />
        <Route path="/competition/patrols" element={<PatrolList />} />
        <Route path="/competition/user" element={<UserPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/encyclopedia" element={<Encyclopedia />} />
        <Route path="/trainings" element={<Training />} />
        <Route path="/tournaments" element={<TournamentList />} />
        <Route path="/apply/:tournamentId" element={<PublicApplication />} />
        <Route path="/applications" element={<UserApplications />} />
        <Route
          path="/admin/applications"
          element={
            <ProtectedAdminRoute>
              <AdminApplications />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </main>
  );
}

export default Content;
