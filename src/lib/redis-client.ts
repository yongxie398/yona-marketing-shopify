let redisClient: any = null;

export function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }
  
  try {
    const { createClient } = require('redis');
    
    const redisHost = process.env.REDIS_CLOUD_HOST;
    const redisPort = parseInt(process.env.REDIS_CLOUD_PORT || '6379');
    const redisUsername = process.env.REDIS_CLOUD_USERNAME;
    const redisPassword = process.env.REDIS_CLOUD_PASSWORD;
    
    let clientConfig: any;
    
    if (redisHost && redisPassword) {
      clientConfig = {
        socket: {
          host: redisHost,
          port: redisPort,
        },
        username: redisUsername || 'default',
        password: redisPassword,
        database: 0,
        disableOfflineQueue: false,
      };
    } else {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      clientConfig = {
        url: redisUrl
      };
      
      const localRedisPassword = process.env.REDIS_PASSWORD;
      if (localRedisPassword) {
        clientConfig.password = localRedisPassword;
      }
    }
    
    redisClient = createClient(clientConfig);
    return redisClient;
  } catch (error) {
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return getRedisClient() !== null;
}
