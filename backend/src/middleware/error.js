export class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') { super(message); this.status = status; this.code = code; }
}
export function notFound(req, res) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } }); }
export function errorHandler(error, req, res, _next) {
  const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: status >= 500 ? 'An unexpected error occurred' : error.message } });
}
