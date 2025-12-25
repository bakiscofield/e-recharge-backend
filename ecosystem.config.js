module.exports = {
  apps: [
    {
      name: 'e-recharge-backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      watch: false,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
