import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileUp, MapPin, Sparkles, X } from 'lucide-react';
import api from '../lib/api';
import { Button, Card, PageTitle } from '../components/Ui';
import { useT } from '../context/LanguageContext';

export default function NewComplaint() {
  const navigate = useNavigate();
  const t = useT();
  const [form, setForm] = useState({ title: '', description: '', location: { address: '', city: '' }, department: '', urgency: 'medium', language: 'en' });
  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const departments = [['', t('nc_dept_auto')], ['public-works', t('nc_dept_public')], ['water', t('nc_dept_water')], ['sanitation', t('nc_dept_sanitation')], ['electricity', t('nc_dept_electricity')], ['transport', t('nc_dept_transport')], ['health', t('nc_dept_health')]];

  const mutation = useMutation({ mutationFn: async () => {
    const complaint = (await api.post('/complaints', form)).data.data.complaint;
    if (files.length) { const body = new FormData(); files.forEach((file) => body.append('files', file)); await api.post(`/uploads/${complaint._id}`, body, { headers: { 'Content-Type': 'multipart/form-data' } }); }
    return complaint;
  }, onSuccess: setSuccess, onError: (requestError) => setError(requestError.response?.data?.error?.message || 'Please check the form and try again.') });

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  if (success) return <div className="success-panel"><div className="success-icon"><CheckCircle2 size={34} /></div><div className="eyebrow">{t('nc_success_eyebrow')}</div><h1>{t('nc_success_h1')}</h1><p>{t('nc_success_body')}</p><div className="ticket-hero">{success.ticketId}<small>{t('nc_success_ticket_label')}</small></div><div className="success-actions"><Button onClick={() => navigate(`/complaints/${success._id}`)}>{t('nc_success_view')} <ArrowRight size={16} /></Button><Button variant="secondary" onClick={() => { setSuccess(null); setFiles([]); setForm({ title: '', description: '', location: { address: '', city: '' }, department: '', urgency: 'medium', language: 'en' }); }}>{t('nc_success_another')}</Button></div></div>;

  return <><PageTitle eyebrow={t('nc_eyebrow')} title={t('nc_title')} description={t('nc_subtitle')} action={<div className="ai-pill"><Sparkles size={15} /> {t('nc_ai_pill')}</div>} /><form onSubmit={(event) => { event.preventDefault(); setError(''); mutation.mutate(); }} className="form-layout"><Card><div className="form-section"><div className="section-number">{t('nc_sec1_num')}</div><div className="form-section-body"><h3>{t('nc_sec1_title')}</h3><p className="muted">{t('nc_sec1_sub')}</p><label>{t('nc_label_ctitle')}<input name="title" value={form.title} onChange={update} placeholder={t('nc_placeholder_ctitle')} required minLength={5} maxLength={160} /></label><label>{t('nc_label_desc')}<textarea name="description" value={form.description} onChange={update} placeholder={t('nc_placeholder_desc')} required minLength={20} maxLength={10000} /><small className="field-hint">{form.description.length}{t('nc_char_count')}</small></label></div></div><div className="form-section"><div className="section-number">{t('nc_sec2_num')}</div><div className="form-section-body"><h3>{t('nc_sec2_title')}</h3><p className="muted">{t('nc_sec2_sub')}</p><label>{t('nc_label_address')}<div className="input-with-icon"><MapPin size={16} /><input value={form.location.address} onChange={(event) => setForm({ ...form, location: { ...form.location, address: event.target.value } })} placeholder={t('nc_placeholder_address')} required /></div></label><div className="two-col"><label>{t('nc_label_city')}<input value={form.location.city} onChange={(event) => setForm({ ...form, location: { ...form.location, city: event.target.value } })} placeholder={t('nc_placeholder_city')} /></label><label>{t('nc_label_lang')}<select name="language" value={form.language} onChange={update}><option value="en">English</option><option value="hi">हिन्दी</option><option value="mr">मराठी</option></select></label></div></div></div><div className="form-section"><div className="section-number">{t('nc_sec3_num')}</div><div className="form-section-body"><h3>{t('nc_sec3_title')}</h3><p className="muted">{t('nc_sec3_sub')}</p><div className="two-col"><label>{t('nc_label_dept')}<select name="department" value={form.department} onChange={update}>{departments.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>{t('nc_label_urgency')}<select name="urgency" value={form.urgency} onChange={update}><option value="low">{t('nc_urgency_low')}</option><option value="medium">{t('nc_urgency_medium')}</option><option value="high">{t('nc_urgency_high')}</option><option value="critical">{t('nc_urgency_critical')}</option></select></label></div><div className="upload-box"><FileUp size={20} /><div><strong>{t('nc_upload_title')}</strong><span>{t('nc_upload_sub')}</span>{files.length > 0 && <span className="file-list">{files.map((file) => <span key={file.name}>{file.name}<button type="button" onClick={() => setFiles(files.filter((item) => item !== file))}><X size={12} /></button></span>)}</span>}</div><label className="button secondary small-button file-button">{t('nc_upload_btn')}<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 5))} /></label></div></div></div>{error && <div className="form-error">{error}</div>}<div className="form-footer"><span><span className="shield-inline">✓</span> {t('nc_secure')}</span><Button disabled={mutation.isPending}>{mutation.isPending ? t('nc_submitting') : t('nc_submit')} <ArrowRight size={16} /></Button></div></Card></form></>;
}
