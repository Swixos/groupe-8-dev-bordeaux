import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { SiteModule } from './site/site.module';
import { CarbonModule } from './carbon/carbon.module';

const isTestOrSqlite = process.env.DB_TYPE === 'sqlite';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      isTestOrSqlite
        ? {
            type: 'sqlite',
            database: process.env.DB_PATH || ':memory:',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          }
        : {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            database: process.env.DB_NAME || 'carbondb',
            username: process.env.DB_USER || 'carbon',
            password: process.env.DB_PASSWORD || 'carbon',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          },
    ),
    AuthModule,
    SiteModule,
    CarbonModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
