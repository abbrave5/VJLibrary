module.exports = {
  apps: [
    {
      name: 'music-library-backend',
      script: 'server.js', // or your main file
      cwd: __dirname,      // current working directory
      watch: false,        // optionally set to true during development
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
