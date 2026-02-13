import { createClient } from 'redis';

class RedisQueue {
  private client: ReturnType<typeof createClient>;

  constructor() {
    // Try Redis Cloud configuration first, fall back to local Redis if not available
    const redisHost = process.env.REDIS_CLOUD_HOST;
    const redisPort = parseInt(process.env.REDIS_CLOUD_PORT || '6379');
    const redisUsername = process.env.REDIS_CLOUD_USERNAME;
    const redisPassword = process.env.REDIS_CLOUD_PASSWORD;
    
    let clientConfig: any;
    
    // Check if Redis Cloud environment variables are set
    if (redisHost && redisPassword) {
      // Use Redis Cloud configuration
      console.log('Using Redis Cloud configuration');
      console.log('Redis Cloud Host:', redisHost);
      console.log('Redis Cloud Port:', redisPort);
      console.log('Redis Cloud Username:', redisUsername || 'default');
      
      clientConfig = {
        socket: {
          host: redisHost,
          port: redisPort,
        },
        username: redisUsername || 'default',
        password: redisPassword,
        database: 0, // Use database 0
        disableOfflineQueue: false, // Allow offline queuing
      };
    } else {
      // Fallback to local Redis configuration
      console.log('Using local Redis configuration (fallback)');
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const localRedisPassword = process.env.REDIS_PASSWORD || '';
      
      console.log('Redis URL:', redisUrl);
      console.log('Redis Password:', localRedisPassword ? '[REDACTED]' : 'None');
      
      clientConfig = {
        url: redisUrl
      };
      
      // Only add password if it's not empty
      if (localRedisPassword) {
        clientConfig.password = localRedisPassword;
        console.log('Adding password to Redis config');
      }
    }
    
    this.client = createClient(clientConfig);
    this.client.on('error', (err: Error) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('Redis connected'));
    this.client.on('ready', () => console.log('Redis ready'));
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async addToQueue(queueName: string, item: any): Promise<void> {
    await this.connect();
    const itemStr = JSON.stringify(item);
    await this.client.lPush(queueName, itemStr);
  }

  async getFromQueue(queueName: string, timeoutSeconds: number = 5): Promise<any | null> {
    await this.connect();
    const result = await this.client.brPop(queueName, timeoutSeconds);
    if (result) {
      return JSON.parse(result.element);
    }
    return null;
  }

  async getQueueSize(queueName: string): Promise<number> {
    await this.connect();
    return await this.client.lLen(queueName);
  }

  async addToDeadLetterQueue(item: any): Promise<void> {
    await this.connect();
    const itemStr = JSON.stringify(item);
    await this.client.lPush('webhook-dlq', itemStr);
  }

  async getDeadLetterQueueSize(): Promise<number> {
    await this.connect();
    return await this.client.lLen('webhook-dlq');
  }
}

export default RedisQueue;