import { AuditLog } from '../models/AuditLog.js';

export function audit(action, targetType) {
  return async (req, _res, next) => {
    req.audit = { action, targetType };
    next();
  };
}
export async function writeAudit(req, targetId, metadata = {}) {
  if (!req.user) return;
  await AuditLog.create({ actor: req.user._id, action: req.audit?.action || 'request', targetType: req.audit?.targetType || 'system', targetId, metadata, ipAddress: req.ip, userAgent: req.get('user-agent') });
}
