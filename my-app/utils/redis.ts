import { createClient } from 'redis';

// Redis客户端实例
let redisClient: ReturnType<typeof createClient> | null = null;

// 获取Redis客户端
export async function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({
            // 默认连接到本地Redis服务器
            url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
            // 可选配置
            socket: {
                connectTimeout: 5000,
                reconnectStrategy: (retries) => Math.min(retries * 50, 500)
            }
        });

        // 错误处理
        redisClient.on('error', (err) => {
            console.error('Redis客户端错误:', err);
        });

        redisClient.on('connect', () => {
            console.log('Redis连接成功');
        });

        redisClient.on('disconnect', () => {
            console.log('Redis连接断开');
        });

        // 连接到Redis服务器
        await redisClient.connect();
    }
    return redisClient;
}

// 关闭Redis连接
export async function closeRedisClient() {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}

// Redis工具函数
export class RedisService {
    private client: ReturnType<typeof createClient> | null = null;

    constructor() {
        this.init();
    }

    private async init() {
        this.client = await getRedisClient();
    }

    // 设置键值对，支持过期时间（秒）
    async set(key: string, value: string, expireTime?: number): Promise<boolean> {
        try {
            if (!this.client) {
                this.client = await getRedisClient();
            }
            
            if (expireTime) {
                await this.client.setEx(key, expireTime, value);
            } else {
                await this.client.set(key, value);
            }
            return true;
        } catch (error) {
            console.error('Redis设置失败:', error);
            return false;
        }
    }

    // 获取值
    async get(key: string): Promise<string | null> {
        try {
            if (!this.client) {
                this.client = await getRedisClient();
            }
            return await this.client.get(key);
        } catch (error) {
            console.error('Redis获取失败:', error);
            return null;
        }
    }

    // 删除键
    async del(key: string): Promise<boolean> {
        try {
            if (!this.client) {
                this.client = await getRedisClient();
            }
            const result = await this.client.del(key);
            return result > 0;
        } catch (error) {
            console.error('Redis删除失败:', error);
            return false;
        }
    }

    // 检查键是否存在
    async exists(key: string): Promise<boolean> {
        try {
            if (!this.client) {
                this.client = await getRedisClient();
            }
            const result = await this.client.exists(key);
            return result > 0;
        } catch (error) {
            console.error('Redis检查存在失败:', error);
            return false;
        }
    }

    // 设置过期时间
    async expire(key: string, seconds: number): Promise<boolean> {
        try {
            if (!this.client) {
                this.client = await getRedisClient();
            }
            const result = await this.client.expire(key, seconds);
            return result === 1;
        } catch (error) {
            console.error('Redis设置过期时间失败:', error);
            return false;
        }
    }
}

// 创建Redis服务实例
export const redisService = new RedisService();