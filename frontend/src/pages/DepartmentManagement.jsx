import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { useT } from '../context/LanguageContext';
import { Card, Loading, PageTitle } from '../components/Ui';

export default function DepartmentManagement() {
  const t = useT();
  const { data: deptsData, isLoading } = useQuery({
    queryKey: ['admin-departments-list'],
    queryFn: async () => (await api.get('/admin/departments')).data.data
  });

  if (isLoading) return <Loading />;

  const departments = deptsData?.departments || [];

  return (
    <>
      <PageTitle 
        eyebrow={t('dm_eyebrow')} 
        title={t('dm_title')} 
        description={t('dm_desc')} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {departments.map(dept => (
          <Card key={dept._id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{dept.name}</h3>
                <span className="badge teal" style={{ fontSize: '11px', marginTop: '4px', display: 'inline-block' }}>
                  {t('dm_code')}: {dept.code?.toUpperCase()}
                </span>
              </div>
              <Building2 size={20} className="muted-icon" />
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0, flexGrow: 1 }}>
              {dept.description || `${t('dm_default_desc')} ${dept.name}.`}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--line)', fontSize: '12px', color: 'var(--muted)' }}>
              <span>{t('dm_target_sla')}: {dept.slaHours || 48} {t('dm_hours')}</span>
              <span style={{ color: 'var(--mint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> {t('sdash_active_status')}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
