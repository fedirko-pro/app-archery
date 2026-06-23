import './Content.scss';

import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';

import {
  ROLES_CAN_ACCESS_CONTROL,
  ROLES_CAN_DELETE_AND_MANAGE_APPS,
  ROLES_CAN_MANAGE_REFERENCE_DATA,
} from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import { getDefaultLandingPath } from '../../utils/default-landing';
import { normalizeAppLang } from '../../utils/i18n-lang';
import About from '../../views/About';
import Achievements from '../../views/achievements/achievements';
import AccessControl from '../../views/admin/access-control/access-control';
import AdminPanel from '../../views/admin/admin-panel';
import ProtectedAdminRoute from '../../views/admin/protected-admin-route';
import UserEdit from '../../views/admin/user-edit/user-edit';
import UserProfileView from '../../views/admin/user-profile-view/user-profile-view';
import CategoryEdit from '../../views/categories/admin/category-edit';
import Categories from '../../views/categories/Categories';
import ClubEdit from '../../views/clubs/admin/club-edit';
import Clubs from '../../views/clubs/Clubs';
import UserPage from '../../views/competition/user-page/user-page';
import ConverterPage from '../../views/ConverterPage';
import DivisionEdit from '../../views/divisions/admin/division-edit';
import Divisions from '../../views/divisions/Divisions';
import Encyclopedia from '../../views/Encyclopedia';
import HomePage from '../../views/Home';
import MyEquipmentPage from '../../views/MyEquipment';
import MyPaymentsPage from '../../views/MyPayments';
import MyStatisticsPage from '../../views/MyStatistics';
import MyTrainingsPage from '../../views/MyTrainings';
import NotFound from '../../views/NotFound';
import OnboardingPage from '../../views/Onboarding';
import Profile from '../../views/profile/profile';
import ProfileEditPage from '../../views/profile/profile-edit-page';
import ProtectedRoute from '../../views/protected-route';
import ResetPassword from '../../views/reset-password/reset-password';
import Rules from '../../views/rules/Rules';
import SignIn from '../../views/sign-in/sign-in';
import SignUp from '../../views/sign-up/sign-up';
import AdminApplications from '../../views/tournament/admin-applications/admin-applications';
import PatrolsPage from '../../views/tournament/patrols/PatrolsPage';
import PublicApplication from '../../views/tournament/public-application/public-application';
import TournamentCreate from '../../views/tournament/tournament-create/tournament-create';
import TournamentDetail from '../../views/tournament/tournament-detail/tournament-detail';
import TournamentEdit from '../../views/tournament/tournament-edit/tournament-edit';
import TournamentFeedbackAdmin from '../../views/tournament/tournament-feedback-admin/tournament-feedback-admin';
import TournamentFeedback from '../../views/tournament/tournament-feedback/tournament-feedback';
import TournamentList from '../../views/tournament/tournament-list/tournament-list';
import UserApplications from '../../views/tournament/user-applications/user-applications';
import Training from '../../views/Trainings';

function DefaultLandingRedirect() {
  const { user, loading } = useAuth();
  const { lang } = useParams();
  const currentLang = normalizeAppLang(lang);
  const landingPath = getDefaultLandingPath(currentLang, user);
  const segment = landingPath.split('/').pop() ?? 'tournaments';

  if (loading) {
    return null;
  }

  return <Navigate to={segment} replace />;
}

function LangLayout() {
  return <Outlet />;
}

function Content() {
  return (
    <main>
      <Routes>
        <Route path=":lang" element={<LangLayout />}>
          <Route index element={<DefaultLandingRedirect />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
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
          <Route path="achievements" element={<Achievements />} />
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
          <Route
            path="admin/access-control"
            element={
              <ProtectedAdminRoute allowedRoles={ROLES_CAN_ACCESS_CONTROL}>
                <AccessControl />
              </ProtectedAdminRoute>
            }
          />
          <Route path="converter" element={<ConverterPage />} />
          <Route path="competition/user" element={<UserPage />} />
          <Route path="about" element={<About />} />
          <Route path="categories" element={<Categories />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="divisions" element={<Divisions />} />
          <Route path="rules" element={<Rules />} />
          <Route path="encyclopedia" element={<Encyclopedia />} />
          <Route path="home" element={<HomePage />} />
          <Route
            path="onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route path="trainings" element={<MyTrainingsPage />} />
          <Route path="equipment" element={<MyEquipmentPage />} />
          <Route path="statistics" element={<MyStatisticsPage />} />
          <Route path="payments" element={<MyPaymentsPage />} />
          <Route path="trainings-legacy" element={<Training />} />
          <Route path="tournaments">
            <Route index element={<TournamentList />} />
            <Route
              path="create"
              element={
                <ProtectedAdminRoute>
                  <TournamentCreate />
                </ProtectedAdminRoute>
              }
            />
            <Route path=":tournamentId" element={<TournamentDetail />} />
            <Route
              path=":tournamentId/feedback"
              element={
                <ProtectedRoute>
                  <TournamentFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path=":tournamentId/feedback/admin"
              element={
                <ProtectedAdminRoute>
                  <TournamentFeedbackAdmin />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path=":tournamentId/edit"
              element={
                <ProtectedAdminRoute>
                  <TournamentEdit />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path=":tournamentId/patrols"
              element={
                <ProtectedAdminRoute allowedRoles={ROLES_CAN_DELETE_AND_MANAGE_APPS}>
                  <PatrolsPage />
                </ProtectedAdminRoute>
              }
            />
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
              <ProtectedAdminRoute allowedRoles={ROLES_CAN_MANAGE_REFERENCE_DATA}>
                <CategoryEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/categories/:id/edit"
            element={
              <ProtectedAdminRoute allowedRoles={ROLES_CAN_MANAGE_REFERENCE_DATA}>
                <CategoryEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/clubs/:id/edit"
            element={
              <ProtectedAdminRoute allowedRoles={ROLES_CAN_MANAGE_REFERENCE_DATA}>
                <ClubEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/clubs/create"
            element={
              <ProtectedAdminRoute allowedRoles={ROLES_CAN_MANAGE_REFERENCE_DATA}>
                <ClubEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/divisions/:id/edit"
            element={
              <ProtectedAdminRoute allowedRoles={ROLES_CAN_MANAGE_REFERENCE_DATA}>
                <DivisionEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="admin/divisions/create"
            element={
              <ProtectedAdminRoute allowedRoles={ROLES_CAN_MANAGE_REFERENCE_DATA}>
                <DivisionEdit />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </main>
  );
}

export default Content;
