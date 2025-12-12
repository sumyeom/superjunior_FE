const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    port: 8080,  // 프론트엔드 포트 명시
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // API Gateway
        changeOrigin: true,
        logLevel: 'debug',  // ← 프록시 로그 활성화
        // pathRewrite 없음 = /api가 그대로 전달됨
      },
      '/swagger-ui.html': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/swagger-ui': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/v3/api-docs': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    }
  },
  transpileDependencies: true
})