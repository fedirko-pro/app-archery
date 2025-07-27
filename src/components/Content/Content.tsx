import './content.scss';
import { Route, Routes } from 'react-router-dom';
import About from '../../pages/about.tsx';
import Converter from '../../pages/converter/converter.tsx';
import Encyclopedia from '../../pages/encyclopedia.tsx';
import Training from '../../pages/trainings.tsx';
import PatrolList from '../../pages/competition/patrol-list/patrol-list.tsx';
import UserPage from '../../pages/competition/user-page/user-page.tsx';
import SignIn from '../../pages/sign-in/sign-in.tsx';
import SignUp from '../../pages/sign-up/sign-up.tsx';
import Profile from '../../pages/profile/profile.tsx';
import Competition from '../../pages/competition/competition.tsx';
import CompetitionsList
  from '../../pages/competition/competitions-list/competitions-list.tsx';
import Achievements from '../../pages/achievements/achievements.tsx';
import ResetPassword from '../../pages/reset-password/reset-password.tsx';
import AdminPanel from '../../pages/admin/admin-panel.tsx';
import ProtectedAdminRoute from '../../pages/admin/protected-admin-route.tsx';
import UserProfileView from '../../pages/admin/user-profile-view/user-profile-view.tsx';
import UserEdit from '../../pages/admin/user-edit/user-edit.tsx';
// TODO: Settings temporarily disabled - functionality moved to Profile
// import Settings from '../settings/settings.tsx';
import GoogleCallback from '../../pages/google-callback/google-callback.tsx';
import TournamentList from '../../pages/tournament/tournament-list/tournament-list.tsx';
import UserApplications from '../../pages/tournament/user-applications/user-applications.tsx';
import AdminApplications from '../../pages/tournament/admin-applications/admin-applications.tsx';
import PublicApplication from '../../pages/tournament/public-application/public-application.tsx';
import ProfileEditPage from '../../pages/profile/profile-edit-page.tsx';

function Content() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Converter />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route 
          path="/admin" 
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
