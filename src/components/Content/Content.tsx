import './content.scss';
import { Route, Routes } from 'react-router-dom';
import About from '../../pages/about.tsx';
import Converter from '../converter/converter.tsx';
import Encyclopedia from '../../pages/encyclopedia.tsx';
import Training from '../../pages/trainings.tsx';
import PatrolList from '../competition/patrol-list/patrol-list.tsx';
import UserPage from '../competition/user-page/user-page.tsx';
import SignIn from '../sign-in/sign-in.tsx';
import SignUp from '../sign-up/sign-up.tsx';
import Profile from '../profile/profile.tsx';
import Competition from '../competition/competition.tsx';
import CompetitionsList
  from '../competition/competitions-list/competitions-list.tsx';
import Achievements from '../achievements/achievements.tsx';
import ResetPassword from '../reset-password/reset-password.tsx';
import AdminPanel from '../admin/admin-panel.tsx';
import ProtectedAdminRoute from '../admin/protected-admin-route.tsx';
import UserProfileView from '../admin/user-profile-view/user-profile-view.tsx';
import UserEdit from '../admin/user-edit/user-edit.tsx';
// TODO: Settings temporarily disabled - functionality moved to Profile
// import Settings from '../settings/settings.tsx';
import GoogleCallback from '../google-callback/google-callback.tsx';

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
      </Routes>
    </main>
  );
}

export default Content;
