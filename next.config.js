module.exports = {
    publicRuntimeConfig: {
        // Will be available on both server and client
        NEXT_PUBLIC_EXPLORER_WS: process.env.NEXT_PUBLIC_EXPLORER_WS || 'ws://localhost:3001'
      },
  }
  