module.exports = {
  apps: [
    {
      name: 'e-recharge-backend',
      script: './start-pm2.sh',
      instances: 1,
      exec_mode: 'fork', // fork mode pour utiliser un script shell
      interpreter: 'bash',
      env: {
        NODE_ENV: 'production',
        PORT: 5004
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
      },
      // Hooks PM2
      post_update: [
        'npm install',
        'npm run build',
        'npx prisma generate',
        'npx prisma migrate deploy'
      ],
      // Préserver les variables d'environnement
      merge_logs: true,
      combine_logs: true
    }
  ]
};
