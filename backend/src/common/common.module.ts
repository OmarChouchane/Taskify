import { Global, Module } from '@nestjs/common';
import { HashService } from './services/hash.service';
import { UuidService } from './services/uuid.service';

export { HashService, UuidService };
export * from './enums/action-type.enum';
export * from './enums/role.enum';

@Global()
@Module({
  providers: [HashService, UuidService],
  exports: [HashService, UuidService],
})
export class CommonModule {}
