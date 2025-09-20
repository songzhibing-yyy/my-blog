import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { UserAuth,User } from '@/db/entity'
const host = process.env.DATABASE_HOST;
const port = process.env.DATABASE_PORT;
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;
// 创建全局的DataSource实例
let AppDataSource: DataSource | null = null;

export const prepareConnection = async (): Promise<DataSource> => {
    // 如果已经有连接实例且已初始化，直接返回
    if (AppDataSource && AppDataSource.isInitialized) {
        return AppDataSource;
    }

    // 创建新的DataSource实例
    AppDataSource = new DataSource({
        type: 'mysql',
        host: host,
        port: port ? parseInt(port) : 3306,
        username: username,
        password: password,
        database: database,
        synchronize: false,
        logging: true,
        entities: [UserAuth, User],
    });

    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Database connection established');
        }
        return AppDataSource;
    } catch (error) {
        console.error('Error establishing database connection:', error);
        throw error;
    }
}

// 导出获取连接的便捷函数
export const getConnection = async (): Promise<DataSource> => {
    return await prepareConnection();
}