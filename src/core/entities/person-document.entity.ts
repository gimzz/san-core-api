import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Person } from './person.entity';
import { DocumentType } from './document-type.entity';

@Entity({ schema: 'core', name: 'person_documents' })
@Index(['idDocumentType', 'documentNumber'], { unique: true })
@Index(['idPerson', 'idDocumentType'], { unique: true })
export class PersonDocument {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'id_person' })
  idPerson: number;

  @Column({ name: 'id_document_type' })
  idDocumentType: number;

  @Column({ name: 'document_number', length: 50 })
  documentNumber: string;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_person' })
  person: Person;

  @ManyToOne(() => DocumentType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_document_type' })
  documentType: DocumentType;
}
