import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { useUser } from './context/userContext';

// Components
import Layout from './components/layouts/Layout';
import PrivateRoute from './routes/PrivateRoute';

// Pages
import Login from './pages/Auth/Login';
import AdminSignup from './pages/Auth/AdminSignup';
import Dashboard from './pages/User/Dashboard';
import Students from './pages/User/Students';
import Attendance from './pages/User/Attendance';
import StudentProfile from './pages/Student/StudentProfile';
import Leaves from './pages/User/Leaves';
import AddTeacher from './pages/Admin/AddTeacher';
import AddClass from './pages/Admin/AddClass';
import AssignTeacher from './pages/Admin/AssignTeacher';
import MarkAttendance from './pages/User/MarkAttendance';
import CreateStudent from './pages/User/CreateStudent';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TeacherDashboard from './pages/User/TeacherDashboard';
import ManageTimetable from './pages/Admin/ManageTimetable';
import ProfileRequests from './pages/Admin/ProfileRequests';

// New Module Pages
import Mess from './pages/Mess/Mess';
import MessAdmin from './pages/Mess/MessAdmin';
import AddMenu from './pages/Mess/AddMenu';
import Events from './pages/Events/Events';
import Placement from './pages/Placement/Placement';
import PlacementDashboard from './pages/Placement/PlacementDashboard';
import PlacementTracker from './pages/Placement/PlacementTracker';
import Applications from './pages/Placement/Applications';
import RoomRequests from './pages/Mess/RoomRequests';
import MessFeedback from './pages/Mess/MessFeedback';
import Transport from './pages/User/Transport';

// Wrapper to handle redirects based on auth status
const LoginRoute = () => {
    const { isAuthenticated } = useUser();
    return !isAuthenticated ? <Login /> : <Navigate to="/" replace />;
}

// Simple component to route to correct dashboard
// Simple component to redirect to correct role-based path
const DashboardChecker = () => {
    const { user, isAuthenticated } = useUser();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user?.role === 'mess_owner') return <Navigate to="/mess-owner/dashboard" replace />;
    if (user?.role === 'placement_cell') return <Navigate to="/placement-cell/dashboard" replace />;
    
    return <Navigate to="/login" replace />;
}

function App() {
    return (
        <UserProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/login" element={<LoginRoute />} />
                    <Route path="/admin-signup" element={<AdminSignup />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<DashboardChecker />} />

                            {/* ADMIN ROUTES */}
                            <Route path="admin" element={<PrivateRoute allowedRoles={['admin']} />}>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="students" element={<Students />} />
                                <Route path="add-teacher" element={<AddTeacher />} />
                                <Route path="add-class" element={<AddClass />} />
                                <Route path="assign-teacher" element={<AssignTeacher />} />
                                <Route path="timetable" element={<ManageTimetable />} />
                                <Route path="events" element={<Events />} />
                                <Route path="mess" element={<Mess />} />
                                <Route path="transport" element={<Transport />} />
                                <Route path="attendance" element={<Attendance />} />
                                <Route path="profile" element={<StudentProfile />} />
                                <Route path="profile/:id" element={<StudentProfile />} />
                            </Route>

                            {/* TEACHER ROUTES */}
                            <Route path="teacher" element={<PrivateRoute allowedRoles={['teacher']} />}>
                                <Route path="dashboard" element={<TeacherDashboard />} />
                                <Route path="students" element={<Students />} />
                                <Route path="mark-attendance" element={<MarkAttendance />} />
                                <Route path="add-student" element={<CreateStudent />} />
                                <Route path="attendance" element={<Attendance />} />
                                <Route path="leaves" element={<Leaves />} />
                                <Route path="events" element={<Events />} />
                                <Route path="mess" element={<Mess />} />
                                <Route path="transport" element={<Transport />} />
                                <Route path="profile" element={<StudentProfile />} />
                                <Route path="profile/:id" element={<StudentProfile />} />
                            </Route>

                            {/* STUDENT ROUTES */}
                            <Route path="student" element={<PrivateRoute allowedRoles={['student']} />}>
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="attendance" element={<Attendance />} />
                                <Route path="leaves" element={<Leaves />} />
                                <Route path="profile" element={<StudentProfile />} />
                                <Route path="events" element={<Events />} />
                                <Route path="mess" element={<Mess />} />
                                <Route path="transport" element={<Transport />} />
                                <Route path="placement" element={<Placement />} />
                                <Route path="placement/dashboard" element={<PlacementDashboard />} />
                                <Route path="placement/tracker" element={<PlacementTracker />} />
                            </Route>

                            {/* MESS OWNER ROUTES */}
                            <Route path="mess-owner" element={<PrivateRoute allowedRoles={['mess_owner']} />}>
                                <Route path="dashboard" element={<MessAdmin />} />
                                <Route path="feedback" element={<MessFeedback />} />
                                <Route path="menu-update" element={<AddMenu />} />
                                <Route path="room-requests" element={<RoomRequests />} />
                                <Route path="events" element={<Events />} />
                            </Route>

                            {/* PLACEMENT CELL ROUTES */}
                            <Route path="placement-cell" element={<PrivateRoute allowedRoles={['placement_cell']} />}>
                                <Route path="dashboard" element={<PlacementDashboard />} />
                                <Route path="tracker" element={<PlacementTracker />} />
                                <Route path="events" element={<Events />} />
                            </Route>

                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;
