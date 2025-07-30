const { AuditLog } = require('../models');

// Audit logging middleware
const auditLog = (action, resourceType = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    // Override res.send to capture response
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log the action asynchronously
      setImmediate(async () => {
        try {
          const logData = {
            userFin: req.user?.fin || req.user?.faydaId || 'anonymous',
            userRole: req.user?.role || 'unknown',
            patientFin: req.params?.fin || req.body?.patientFin || req.query?.fin,
            action,
            resourceType,
            resourceId: req.params?.id || req.params?.recordId,
            healthCenterId: req.user?.healthCenterId,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            details: {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
              responseTime,
              requestBody: sanitizeRequestBody(req.body),
              queryParams: req.query
            },
            success: res.statusCode < 400,
            errorMessage: res.statusCode >= 400 ? getErrorMessage(data) : null
          };

          await AuditLog.create(logData);
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

// Sanitize request body to remove sensitive information
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'otp'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Extract error message from response data
const getErrorMessage = (data) => {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return parsed.message || parsed.error || 'Unknown error';
    }
    return data?.message || data?.error || 'Unknown error';
  } catch {
    return 'Unknown error';
  }
};

// Specific audit functions for common actions
const auditActions = {
  login: auditLog('login'),
  logout: auditLog('logout'),
  viewRecord: auditLog('view_record', 'medical_record'),
  createRecord: auditLog('create_record', 'medical_record'),
  updateRecord: auditLog('update_record', 'medical_record'),
  deleteRecord: auditLog('delete_record', 'medical_record'),
  searchPatient: auditLog('search_patient', 'patient'),
  exportData: auditLog('export_data'),
  systemAccess: auditLog('system_access')
};

module.exports = {
  auditLog,
  auditActions
};
