import './Content.scss';

import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';

import i18n from '../../i18n';
import About from '../../pages/About';
import Achievements from '../../pages/achievements/achievements';
import AdminPanel from '../../pages/admin/admin-panel';
import ProtectedAdminRoute from '../../pages/admin/protected-admin-route';
import UserEdit from '../../pages/admin/user-edit/user-edit';
import UserProfileView from '../../pages/admin/user-profile-view/user-profile-view';
import CategoryEdit from '../../pages/categories/admin/category-edit';
import Categories from '../../pages/categories/Categories';
import ClubEdit from '../../pages/clubs/admin/club-edit';
import Clubs from '../../pages/clubs/Clubs';
import UserPage from '../../pages/competition/user-page/user-page';
import ConverterPage from '../../pages/ConverterPage';
import DivisionEdit from '../../pages/divisions/admin/division-edit';
import Divisions from '../../pages/divisions/Divisions';
import Encyclopedia from '../../pages/Encyclopedia';
// TODO: Settings temporarily disabled - functionality moved to Profile
// import Settings from '../Settings/Settings.tsx';
import GoogleCallback from '../../pages/google-callback/google-callback';
import NotFound from '../../pages/NotFound';
import Profile from '../../pages/profile/profile';
import ProfileEditPage from '../../pages/profile/profile-edit-page';
import ProtectedRoute from '../../pages/protected-route';
import ResetPassword from '../../pages/reset-password/reset-password';
import Rules from '../../pages/rules/Rules';
import SignIn from '../../pages/sign-in/sign-in';
import SignUp from '../../pages/sign-up/sign-up';
import AdminApplications from '../../pages/tournament/admin-applications/admin-applications';
import PatrolsPage from '../../pages/tournament/patrols/PatrolsPage';
import PublicApplication from '../../pages/tournament/public-application/public-application';
import TournamentCreate from '../../pages/tournament/tournament-create/tournament-create';
import TournamentDetail from '../../pages/tournament/tournament-detail/tournament-detail';
import TournamentEdit from '../../pages/tournament/tournament-edit/tournament-edit';
import TournamentList from '../../pages/tournament/tournament-list/tournament-list';
import UserApplications from '../../pages/tournament/user-applications/user-applications';
import Training from '../../pages/Trainings';
import { isRtlLanguage, normalizeAppLang, toI18nLang, getDefaultAppLang } from '../../utils/i18n-lang';

function LangLayout() {
  const params = useParams();
  const appLang = normalizeAppLang(params.lang);

  useEffect(() => {
    const i18nLang = toI18nLang(appLang);
    if (i18n.language !== i18nLang) {
      void i18n.changeLanguage(i18nLang);
    }
    document.documentElement.setAttribute('lang', i18nLang);
    document.documentElement.setAttribute('dir', isRtlLanguage(appLang) ? 'rtl' : 'ltr');
  }, [appLang]);

  return <Outlet />;
}

function Content() {
  const defaultLang = getDefaultAppLang();

  return (
    <main>
      <Routes>
        <Route path="/" element={<Navigate to={`/${defaultLang}/tournaments`} replace />} />
        {/* Language-agnostic auth routes to avoid 404s from backend redirects */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/signin" element={<Navigate to={`/${defaultLang}/signin`} replace />} />
        <Route path=":lang" element={<LangLayout />}>
          <Route index element={<Navigate to="tournaments" replace />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="auth/google/callback" element={<GoogleCallback />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/users/:userId/profile"
            element={
              <ProtectedAdminRoute>
                <UserProfileView />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/users/:userId/edit"
            element={
              <ProtectedAdminRoute>
                <UserEdit />
              </ProtectedAdminRoute>
            }
          />
          {/* TODO: Settings route temporarily disabled - functionality moved to Profile */}
          {/* <Route path="settings" element={<Settings />} /> */}
          <Route path="converter" element={<ConverterPage />} />
          <Route path="competition/user" element={<UserPage />} />
          <Route path="about" element={<About />} />
          <Route path="categories" element={<Categories />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="divisions" element={<Divisions />} />
          <Route path="rules" element={<Rules />} />
          <Route path="encyclopedia" element={<Encyclopedia />} />
          <Route path="trainings" element={<Training />} />
          <Route path="tournaments">
            <Route index element={<TournamentList />} />
            <Route path="create" element={
              <ProtectedAdminRoute>
                <TournamentCreate />
              </ProtectedAdminRoute>
            } />
            <Route path=":tournamentId" element={<TournamentDetail />} />
            <Route path=":tournamentId/edit" element={
              <ProtectedAdminRoute>
                <TournamentEdit />
              </ProtectedAdminRoute>
            } />
            <Route path=":tournamentId/patrols" element={
              <ProtectedAdminRoute>
                <PatrolsPage />
              </ProtectedAdminRoute>
            } />
          </Route>
          <Route path="apply/:tournamentId" element={<PublicApplication />} />
          <Route path="applications" element={<UserApplications />} />
          <Route
            path="admin/applications"
            element={
              <ProtectedAdminRoute>
                <AdminApplications />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/applications/:tournamentId"
            element={
              <ProtectedAdminRoute>
                <AdminApplications />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/categories/create"
            element={
              <ProtectedAdminRoute>
                <CategoryEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/categories/:id/edit"
            element={
              <ProtectedAdminRoute>
                <CategoryEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/clubs/:id/edit"
            element={
              <ProtectedAdminRoute>
                <ClubEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/clubs/create"
            element={
              <ProtectedAdminRoute>
                <ClubEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/divisions/:id/edit"
            element={
              <ProtectedAdminRoute>
                <DivisionEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/divisions/create"
            element={
              <ProtectedAdminRoute>
                <DivisionEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Navigate to={`/${defaultLang}`} replace />} />
      </Routes>
    </main>
  );
}

export default Content;
