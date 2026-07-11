const PROXY_TARGET = process.env.PROXY_TARGET || 'http://localhost:3001';

module.exports = {
  '/api': {
    target: PROXY_TARGET,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
};
