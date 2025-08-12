module.exports = {
  apps: [{
    name: 'noli-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 4000 -H 127.0.0.1',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production' }
  }]
}
