import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, Sparkles } from 'lucide-react';
import { formatDate, formatStatus, statusTone } from '../lib/format';
import { useT } from '../context/LanguageContext';
export function Button({children,variant='primary',className='',...props}){return <button className={`button ${variant} ${className}`} {...props}>{children}</button>}
export function Card({children,className=''}){return <section className={`card ${className}`}>{children}</section>}
export function Badge({children,tone}){return <span className={`badge ${tone||statusTone(children)}`}>{formatStatus(children)}</span>}
export function StatCard({label,value,change,icon:Icon,accent='teal'}){return <Card className={`stat-card ${accent}`}><div className="stat-head"><span>{label}</span><span className="stat-icon"><Icon size={18}/></span></div><div className="stat-value">{value}</div>{change&&<div className="stat-change">{change}</div>}</Card>}
export function PageTitle({eyebrow,title,description,action}){return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</div>}
export function EmptyState({title,description}){const t=useT(); return <div className="empty-state"><Sparkles size={24}/><strong>{title??t('ui_empty_title')}</strong><span>{description??t('ui_empty_sub')}</span></div>}
export function Loading(){const t=useT(); return <div className="loading"><LoaderCircle className="spin" size={22}/> {t('ui_loading')}</div>}
export function Timeline({items=[]}){const t=useT(); return <div className="timeline">{items.map((item,index)=><motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:index*.04}} className="timeline-item" key={item._id||index}><div className="timeline-icon">{item.status==='resolved'||item.event==='complaint_submitted'?<CheckCircle2 size={16}/>:item.status==='in_progress'?<Clock3 size={16}/>:<AlertCircle size={16}/>}</div><div><strong>{item.event?.replaceAll('_',' ')}</strong><p>{item.comment||t('ui_timeline_default')}</p><small>{formatDate(item.createdAt)}</small></div></motion.div>)}</div>}

