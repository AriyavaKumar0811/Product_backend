module.exports = {
  apps: [{
    name: 'Demo',
    script: './src/app.js',
    out_file: './logs/out.log',
    output: './logs/out.log',
    error: './logs/error.log',
    log: './logs/combined.outerr.log',
    watch: true,
    node_args: '--max_old_space_size=16000',
    ignore_watch: ['./node_modules', './logs'],
    env: {
      NODE_ENV: 'local',
    },
    env_development: {
      NODE_ENV: 'devel',
    },

  }]
};
