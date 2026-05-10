export const jwtConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
