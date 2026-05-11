export const appConfig = () => ({
  port: parseInt(process.env.PORT || process.env.APP_PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.APP_CORS_ALLOW_ORIGIN || '*',
});
