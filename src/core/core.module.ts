import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { DocumentType } from './entities/document-type.entity';
import { PersonDocument } from './entities/person-document.entity';
import { ContactType } from './entities/contact-type.entity';
import { PersonContact } from './entities/person-contact.entity';
import { PersonAddress } from './entities/person-address.entity';
import { CoreService } from './core.service';
import { CoreController } from './core.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Person,
      DocumentType,
      PersonDocument,
      ContactType,
      PersonContact,
      PersonAddress,
    ]),
  ],
  controllers: [CoreController],
  providers: [CoreService],
  exports: [CoreService, TypeOrmModule],
})
export class CoreModule {}