import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, FilePlus2, HelpCircle, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, ShieldCheck, Sun, UserRound, X, Users, Building2, ListFilter } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout({dark,setDark}) { 
  const {user,logout}=useAuth(); 
  const {t}=useLanguage();
  const navigate=useNavigate(); 
  const [open,setOpen]=useState(false); 
  
  const isSuperAdmin = user?.role === 'super_admin';
  const isSecondAdmin = ['department_admin','department_officer'].includes(user?.role);
  const isCitizen = user?.role === 'citizen';

  const citizenLinks = [
    {to:'/user/dashboard',label:t('nav_overview'),icon:LayoutDashboard},
    {to:'/user/complaints/new',label:t('nav_lodge'),icon:FilePlus2},
    {to:'/user/complaints',label:t('lay_my_complaints'),icon:ListFilter},
    {to:'/track',label:t('nav_track'),icon:Search},
    {to:'/notifications',label:t('nav_notifications'),icon:Bell},
    {to:'/user/profile',label:t('nav_profile'),icon:UserRound}
  ];

  const secondAdminLinks = [
    {to:'/second-admin/dashboard',label:t('lay_dept_overview'),icon:LayoutDashboard},
    {to:'/second-admin/queue',label:t('lay_complaint_queue'),icon:ListFilter},
    {to:'/second-admin/analytics',label:t('lay_dept_analytics'),icon:ShieldCheck},
    {to:'/track',label:t('nav_track'),icon:Search},
    {to:'/notifications',label:t('nav_notifications'),icon:Bell},
    {to:'/user/profile',label:t('nav_profile'),icon:UserRound}
  ];

  const superAdminLinks = [
    {to:'/admin/dashboard',label:t('nav_admin'),icon:LayoutDashboard},
    {to:'/admin/complaints',label:t('lay_all_complaints'),icon:ListFilter},
    {to:'/admin/users',label:t('lay_user_directory'),icon:Users},
    {to:'/admin/departments',label:t('lay_departments'),icon:Building2},
    {to:'/review',label:t('nav_review'),icon:Settings},
    {to:'/notifications',label:t('nav_notifications'),icon:Bell},
    {to:'/user/profile',label:t('nav_profile'),icon:UserRound}
  ];

  const navLinks = isSuperAdmin ? superAdminLinks : (isSecondAdmin ? secondAdminLinks : citizenLinks);

  const workspaceLabel = isSuperAdmin ? t('lay_ws_admin') : (isSecondAdmin ? t('lay_ws_dept') : t('lay_ws_citizen'));
  const breadcrumbRole = isSuperAdmin ? t('lay_bc_admin') : (isSecondAdmin ? t('lay_bc_dept') : t('lay_bc_citizen'));

  return (
    <div className={dark?'app dark':'app'}>
      <aside className={open?'sidebar open':'sidebar'}>
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span>Civic<span>Flow</span></span>
          <button className="icon-button mobile-only" onClick={()=>setOpen(false)}><X size={18}/></button>
        </div>
        <div className="workspace-label">
          {workspaceLabel}
        </div>
        <nav>
          {navLinks.map(({to,label,icon:Icon})=>(
            <NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'nav-link active':'nav-link'}>
              <Icon size={18}/>
              <span>{label}</span>
              {label===t('nav_notifications')&&<span className="nav-dot"/>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/help" className="nav-link"><HelpCircle size={18}/><span>{t('nav_help')}</span></NavLink>
          <div className="profile-mini">
            <div className="avatar">{user?.name?.[0]||'C'}</div>
            <div>
              <strong>{user?.name||'User'}</strong>
              <small>{user?.role?.replaceAll('_',' ')}</small>
            </div>
            <button onClick={logout} className="icon-button" title={t('nav_signout')}><LogOut size={16}/></button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={()=>setOpen(true)}><Menu size={20}/></button>
          <div className="breadcrumb">CivicFlow <ChevronRight size={14}/> <span>{breadcrumbRole} {t('nav_workspace')}</span></div>
          <div className="top-actions">
            <LanguageSwitcher />
            <button className="icon-button" onClick={()=>setDark(!dark)} title={t('nav_toggle_theme')}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
            <NavLink to="/notifications" className="icon-button notification-button"><Bell size={18}/><span className="notification-pulse"/></NavLink>
            <div className="avatar small">{user?.name?.[0]||'C'}</div>
          </div>
        </header>
        <div className="content"><Outlet/></div>
      </main>
    </div>
  );
}
