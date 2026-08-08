import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing'; 
import Auth from './pages/Auth'; 
import Dashboard from './pages/Dashboard'; 
import SecondAdminDashboard from './pages/SecondAdminDashboard'; 
import AdminDashboard from './pages/AdminDashboard'; 
import UserManagement from './pages/UserManagement'; 
import DepartmentManagement from './pages/DepartmentManagement'; 
import NewComplaint from './pages/NewComplaint'; 
import Complaints from './pages/Complaints'; 
import ComplaintDetails from './pages/ComplaintDetails'; 
import Track from './pages/Track'; 
import Notifications from './pages/Notifications'; 
import Profile from './pages/Profile'; 
import Admin from './pages/Admin'; 
import Review from './pages/Review'; 
import Help from './pages/Help'; 
import NotFound from './pages/NotFound';

function Protected({children}) {
  const {user} = useAuth(); 
  return user ? children : <Navigate to="/login" replace/>;
} 

function SecondAdminOnly({children}) {
  const {user} = useAuth(); 
  return ['department_admin','department_officer','super_admin'].includes(user?.role) ? children : <Navigate to="/dashboard" replace/>;
}

function AdminOnly({children}) {
  const {user} = useAuth(); 
  return user?.role === 'super_admin' ? children : <Navigate to="/dashboard" replace/>;
}

function RoleDashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
  if (['department_admin', 'department_officer'].includes(user?.role)) return <Navigate to="/second-admin/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
}

export default function App() {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark'); 
  useEffect(() => { localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark]); 
  
  return (
    <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/login" element={<Auth mode="login"/>}/>
      <Route path="/signup" element={<Auth mode="signup"/>}/>
      <Route path="/track" element={<Track/>}/>
      
      <Route element={<Protected><Layout dark={dark} setDark={setDark}/></Protected>}>
        {/* Redirect based on role */}
        <Route path="/dashboard" element={<RoleDashboardRedirect/>}/>
        
        {/* User / Citizen Routes */}
        <Route path="/user/dashboard" element={<Dashboard/>}/>
        <Route path="/user/complaints" element={<Complaints/>}/>
        <Route path="/user/complaints/new" element={<NewComplaint/>}/>
        <Route path="/user/complaints/:id" element={<ComplaintDetails/>}/>
        <Route path="/user/profile" element={<Profile/>}/>
        
        {/* Existing / Legacy Citizen Route aliases */}
        <Route path="/complaints/new" element={<NewComplaint/>}/>
        <Route path="/complaints" element={<Complaints/>}/>
        <Route path="/complaints/:id" element={<ComplaintDetails/>}/>
        <Route path="/notifications" element={<Notifications/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/help" element={<Help/>}/>
        
        {/* Second Admin (Department Officer / Admin) Routes */}
        <Route path="/second-admin/dashboard" element={<SecondAdminOnly><SecondAdminDashboard/></SecondAdminOnly>}/>
        <Route path="/second-admin/queue" element={<SecondAdminOnly><Complaints/></SecondAdminOnly>}/>
        <Route path="/second-admin/analytics" element={<SecondAdminOnly><Admin/></SecondAdminOnly>}/>

        {/* Admin (Super Admin) Routes */}
        <Route path="/admin" element={<AdminOnly><AdminDashboard/></AdminOnly>}/>
        <Route path="/admin/dashboard" element={<AdminOnly><AdminDashboard/></AdminOnly>}/>
        <Route path="/admin/complaints" element={<AdminOnly><Complaints/></AdminOnly>}/>
        <Route path="/admin/users" element={<AdminOnly><UserManagement/></AdminOnly>}/>
        <Route path="/admin/departments" element={<AdminOnly><DepartmentManagement/></AdminOnly>}/>
        <Route path="/review" element={<AdminOnly><Review/></AdminOnly>}/>
      </Route>
      
      <Route path="*" element={<NotFound/>}/>
    </Routes>
  );
}

