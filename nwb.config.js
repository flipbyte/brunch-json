module.exports = {
  type: 'web-module',
  npm: {
    esModules: true,
    umd: false
  },
  karma: {
    frameworks: ['mocha', 'chai'],
    plugins: [
      require('karma-chai-plugins')
    ]
  }
}
