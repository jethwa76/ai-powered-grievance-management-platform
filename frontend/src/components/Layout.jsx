import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, FilePlus2, HelpCircle, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, ShieldCheck, Sun, UserRound, X, Users, Building2, ListFilter } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
import { useT } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
export default function Layout({dark,setDark}) { const {user,logout}=useAuth(); const navigate=useNavigate(); const [open,setOpen]=useState(false); const t=useT(); const isAdmin=['super_admin','department_admin','ai_review_officer'].includes(user?.role); const links=[{to:'/dashboard',labelKey:'nav_overview',icon:LayoutDashboard},{to:'/complaints/new',labelKey:'nav_lodge',icon:FilePlus2},{to:'/track',labelKey:'nav_track',icon:Search},{to:'/notifications',labelKey:'nav_notifications',icon:Bell},{to:'/profile',labelKey:'nav_profile',icon:UserRound}]; return <div className={dark?'app dark':'app'}><aside className={open?'sidebar open':'sidebar'}><div className="brand"><span className="brand-mark">✦</span><span>Civic<span>Flow</span></span><button className="icon-button mobile-only" onClick={()=>setOpen(false)}><X size={18}/></button></div><div className="workspace-label">{t('nav_workspace')}</div><nav>{links.map(({to,labelKey,icon:Icon})=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'nav-link active':'nav-link'}><Icon size={18}/><span>{t(labelKey)}</span>{labelKey==='nav_notifications'&&<span className="nav-dot"/>}</NavLink>)}{isAdmin&&<><div className="workspace-label top-space">{t('nav_operations')}</div><NavLink to="/admin" className="nav-link" onClick={()=>setOpen(false)}><ShieldCheck size={18}/><span>{t('nav_admin')}</span></NavLink><NavLink to="/review" className="nav-link" onClick={()=>setOpen(false)}><Settings size={18}/><span>{t('nav_review')}</span></NavLink></>}</nav><div className="sidebar-bottom"><LanguageSwitcher className="sidebar-lang"/><NavLink to="/help" className="nav-link"><HelpCircle size={18}/><span>{t('nav_help')}</span></NavLink><div className="profile-mini"><div className="avatar">{user?.name?.[0]||'C'}</div><div><strong>{user?.name||'Citizen'}</strong><small>{user?.role?.replaceAll('_',' ')}</small></div><button onClick={logout} className="icon-button" title={t('nav_signout')}><LogOut size={16}/></button></div></div></aside><main className="main"><header className="topbar"><button className="icon-button mobile-only" onClick={()=>setOpen(true)}><Menu size={20}/></button><div className="breadcrumb">CivicFlow <ChevronRight size={14}/> <span>Workspace</span></div><div className="top-actions"><button className="icon-button" onClick={()=>setDark(!dark)} title={t('nav_toggle_theme')}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><NavLink to="/notifications" className="icon-button notification-button"><Bell size={18}/><span className="notification-pulse"/></NavLink><div className="avatar small">{user?.name?.[0]||'C'}</div></div></header><div className="content"><Outlet/></div></main></div> }

=======

export default function Layout({dark,setDark}) { 
  const {user,logout}=useAuth(); 
  const navigate=useNavigate(); 
  const [open,setOpen]=useState(false); 
  
  const isSuperAdmin = user?.role === 'super_admin';
  const isSecondAdmin = ['department_admin','department_officer'].includes(user?.role);
  const isCitizen = user?.role === 'citizen';

  const citizenLinks = [
    {to:'/user/dashboard',label:'Overview',icon:LayoutDashboard},
    {to:'/user/complaints/new',label:'Lodge complaint',icon:FilePlus2},
    {to:'/user/complaints',label:'My Complaints',icon:ListFilter},
    {to:'/track',label:'Track a ticket',icon:Search},
    {to:'/notifications',label:'Notifications',icon:Bell},
    {to:'/user/profile',label:'My profile',icon:UserRound}
  ];

  const secondAdminLinks = [
    {to:'/second-admin/dashboard',label:'Dept Overview',icon:LayoutDashboard},
    {to:'/second-admin/queue',label:'Complaint Queue',icon:ListFilter},
    {to:'/second-admin/analytics',label:'Dept Analytics',icon:ShieldCheck},
    {to:'/track',label:'Track a ticket',icon:Search},
    {to:'/notifications',label:'Notifications',icon:Bell},
    {to:'/user/profile',label:'My profile',icon:UserRound}
  ];

  const superAdminLinks = [
    {to:'/admin/dashboard',label:'Admin Console',icon:LayoutDashboard},
    {to:'/admin/complaints',label:'All Complaints',icon:ListFilter},
    {to:'/admin/users',label:'User Directory',icon:Users},
    {to:'/admin/departments',label:'Departments',icon:Building2},
    {to:'/review',label:'AI Review Queue',icon:Settings},
    {to:'/notifications',label:'Notifications',icon:Bell},
    {to:'/user/profile',label:'My profile',icon:UserRound}
  ];

  const navLinks = isSuperAdmin ? superAdminLinks : (isSecondAdmin ? secondAdminLinks : citizenLinks);

  return (
    <div className={dark?'app dark':'app'}>
      <aside className={open?'sidebar open':'sidebar'}>
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span>Civic<span>Flow</span></span>
          <button className="icon-button mobile-only" onClick={()=>setOpen(false)}><X size={18}/></button>
        </div>
        <div className="workspace-label">
          {isSuperAdmin ? 'ADMIN WORKSPACE' : (isSecondAdmin ? 'DEPARTMENT WORKSPACE' : 'CITIZEN WORKSPACE')}
        </div>
        <nav>
          {navLinks.map(({to,label,icon:Icon})=>(
            <NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'nav-link active':'nav-link'}>
              <Icon size={18}/>
              <span>{label}</span>
              {label==='Notifications'&&<span className="nav-dot"/>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/help" className="nav-link"><HelpCircle size={18}/><span>Help & settings</span></NavLink>
          <div className="profile-mini">
            <div className="avatar">{user?.name?.[0]||'C'}</div>
            <div>
              <strong>{user?.name||'User'}</strong>
              <small>{user?.role?.replaceAll('_',' ')}</small>
            </div>
            <button onClick={logout} className="icon-button" title="Sign out"><LogOut size={16}/></button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={()=>setOpen(true)}><Menu size={20}/></button>
          <div className="breadcrumb">CivicFlow <ChevronRight size={14}/> <span>{isSuperAdmin ? 'Admin' : (isSecondAdmin ? 'Department' : 'Citizen')} Workspace</span></div>
          <div className="top-actions">
            <button className="icon-button" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
            <NavLink to="/notifications" className="icon-button notification-button"><Bell size={18}/><span className="notification-pulse"/></NavLink>
            <div className="avatar small">{user?.name?.[0]||'C'}</div>
          </div>
        </header>
        <div className="content"><Outlet/></div>
      </main>
    </div>
  );
}
>>>>>>> f3c302c34536cff29c4ba4be1c87675d35d06a84
