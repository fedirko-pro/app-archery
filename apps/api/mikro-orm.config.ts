import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { loadRootEnv } from './src/config/load-root-env';

loadRootEnv();

const config: Options = {
  driver: PostgreSqlDriver,
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  user: process.env.DATABASE_USER || 'archery_user',
  password: process.env.DATABASE_PASSWORD || 'archery_password',
  dbName: process.env.DATABASE_NAME || 'archery_db',
  
  // Вказуємо реальні шляхи після компіляції
  entities: ['./dist/src/**/*.entity.js'],
  entitiesTs: ['./dist/src/**/*.entity.js'], // 👈 Примушуємо шукати JS файли
  
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './dist/src/migrations',
    pathTs: './src/migrations', // 👈 Змінюємо назад на src
    glob: '!(*.d).{js,ts}',
  },
  seeder: {
    path: './dist/src/seeders',
    pathTs: './dist/src/seeders', // 👈 Повертаємо на dist!
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
  },
};

export default config;