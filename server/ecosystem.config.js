module.exports = {
    apps: [
        {
            name: 'mini-pos-backend',
            script: './index.js',
            // Use the environment variable PORT defined in index.js (default 2018)
            env: {
                NODE_ENV: 'production',
                PORT: '2018'
            },
            // Restart automatically if the process crashes or the server restarts
            autorestart: true,
            // Watch for file changes in the server folder (optional, useful during dev)
            watch: false,
            // Log files
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm Z'
        }
    ]
};
