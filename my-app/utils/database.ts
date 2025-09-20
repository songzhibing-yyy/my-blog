import mysql from 'mysql2/promise';

interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

interface User {
    id: number;
    nickname: string;
    avatar: string;
    job: string;
    introduce: string;
    create_time: Date;
    update_time: Date;
}

interface UserAuth {
    id: number;
    user_id: number;
    identity_type: string;
    identifier: string;
    credential: string;
    create_time: Date;
    update_time: Date;
}

interface UserWithAuth extends User {
    identity_type?: string;
    identifier?: string;
    credential?: string;
}

// 数据库连接池
let connectionPool: mysql.Pool | null = null;

export async function getDatabase() {
    if (!connectionPool) {
        const config: DatabaseConfig = {
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '3306'),
            user: process.env.DATABASE_USERNAME || 'root',
            password: process.env.DATABASE_PASSWORD || 'root',
            database: process.env.DATABASE_NAME || 'tomas',
        };

        connectionPool = mysql.createPool({
            ...config,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            // 设置字符集
            charset: 'utf8mb4',
            // 允许多条语句
            multipleStatements: true
        });

        console.log('Database pool created');
        
        // 初始化数据库表
        await initializeTables();
    }

    return connectionPool;
}

// 初始化数据库表
async function initializeTables() {
    if (!connectionPool) return;
    
    try {
        // 创建用户表
        await connectionPool.execute(`
            CREATE TABLE \`users\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`nickname\` varchar(255) NOT NULL,
                \`avatar\` varchar(255) DEFAULT NULL,
                \`job\` varchar(255) DEFAULT NULL,
                \`introduce\` varchar(255) DEFAULT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
        `);

        // 创建用户认证表
        await connectionPool.execute(`
            CREATE TABLE \`user_auth\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`user_id\` int(11) NOT NULL,
                \`identity_type\` varchar(20) NOT NULL,
                \`identifier\` varchar(100) NOT NULL,
                \`credential\` varchar(255) DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`unique_auth\` (\`identity_type\`,\`identifier\`),
                KEY \`fk_user_auth_user\` (\`user_id\`)
            ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
        `);

        console.log('Database tables initialized');
    } catch (error) {
        console.error('Error initializing database tables:', error);
    }
}

// 用户相关的数据库操作
export class UserService {
    static async findUserAuthByPhone(phone: string): Promise<UserWithAuth | null> {
        const db = await getDatabase();
        const [rows] = await db.execute(
            `SELECT ua.*, u.* 
             FROM user_auth ua 
             JOIN users u ON ua.user_id = u.id 
             WHERE ua.identity_type = 'phone' AND ua.identifier = ?`,
            [phone]
        );
        const results = rows as UserWithAuth[];
        return results[0] || null;
    }

    static async createUser(userData: {
        nickname: string;
        avatar: string;
        job: string;
        introduce: string;
    }) {
        const db = await getDatabase();
        console.log('Creating user with data:', userData);
        const [result] = await db.execute(
            'INSERT INTO users (nickname, avatar, job, introduce) VALUES (?, ?, ?, ?)',
            [userData.nickname, userData.avatar, userData.job, userData.introduce]
        );
        console.log('User created with ID:', (result as mysql.ResultSetHeader).insertId);
        return (result as mysql.ResultSetHeader).insertId;
    }

    static async createUserAuth(authData: {
        user_id: number;
        identity_type: string;
        identifier: string;
        credential: string;
    }) {
        const db = await getDatabase();
        const [result] = await db.execute(
            'INSERT INTO user_auth (user_id, identity_type, identifier, credential) VALUES (?, ?, ?, ?)',
            [authData.user_id, authData.identity_type, authData.identifier, authData.credential]
        );
        return (result as mysql.ResultSetHeader).insertId;
    }

    static async getUserById(id: number): Promise<User | null> {
        const db = await getDatabase();
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        const results = rows as User[];
        return results[0] || null;
    }
}

const databaseUtils = { getDatabase, UserService };
export default databaseUtils;