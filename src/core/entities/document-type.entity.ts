import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'core', name: 'document_types' })
export class DocumentType {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;
}
