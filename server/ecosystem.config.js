module.exports = {
  apps: [
    {
      name: 'picsta-server',
      script: 'server.js',
      instances: 'max',       // Scale to all available CPU cores
      exec_mode: 'cluster',    // Run in cluster mode for zero-downtime reloads
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      // Reliability
      autorestart: true,
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100
    }
  ]
};
