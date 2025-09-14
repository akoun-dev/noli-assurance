import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || 'production',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
      beforeSend(event) {
        // Filtrer les erreurs sensibles
        if (event.request?.url?.includes('/api/auth')) {
          event.request.headers = {
            ...event.request.headers,
            authorization: '[Filtered]',
          };
        }
        return event;
      },
    });
  } else {
    // Configuration pour le développement
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '1.0'),
      debug: true,
    });
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      component: 'noli-assurance',
      version: process.env.npm_package_version || '1.0.0',
    },
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, {
    level,
    tags: {
      component: 'noli-assurance',
      version: process.env.npm_package_version || '1.0.0',
    },
  });
}

export function setUserContext(user: { id: string; email: string; role: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

// Exporter le client Sentry pour un accès direct si nécessaire
export { Sentry };
