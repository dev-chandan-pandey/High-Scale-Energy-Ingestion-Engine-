import { Module, Global } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { DatabaseHealth } from './database.health';

@Global()
@Module({
  providers: [databaseProvider, DatabaseHealth],
  exports: [databaseProvider],
})
export class DatabaseModule {}
