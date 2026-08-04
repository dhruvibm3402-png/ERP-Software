import Redis from 'ioredis';
import logger from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisClient {
    private static instance: Redis;

    private constructor() { }

    public static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(redisUrl, {
                retryStrategy: (times) => {
                    logger.warn(`Redis retrying connection: attempt ${times}`);
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
            });

            RedisClient.instance.on('connect', () => {
                logger.info('Redis connected successfully');
            });

            RedisClient.instance.on('error', (err) => {
                logger.error(`Redis connection error: ${err}`);
            });
        }

        return RedisClient.instance;
    }
}

export default RedisClient.getInstance();
