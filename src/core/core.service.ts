import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { PersonDocument } from './entities/person-document.entity';
import { PersonContact } from './entities/person-contact.entity';
import { PersonAddress } from './entities/person-address.entity';
import { DocumentType } from './entities/document-type.entity';
import { ContactType } from './entities/contact-type.entity';
import {
  UpdatePersonProfileDto,
  AddDocumentDto,
  AddContactDto,
  AddAddressDto,
} from './dto/core.dto';

@Injectable()
export class CoreService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(PersonDocument)
    private readonly documentRepository: Repository<PersonDocument>,
    @InjectRepository(PersonContact)
    private readonly contactRepository: Repository<PersonContact>,
    @InjectRepository(PersonAddress)
    private readonly addressRepository: Repository<PersonAddress>,
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
    @InjectRepository(ContactType)
    private readonly contactTypeRepository: Repository<ContactType>,
  ) {}

  async getPersonFullProfile(personId: number) {
    const person = await this.personRepository.findOne({
      where: { id: personId },
    });
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }

    const [documents, contacts, addresses] = await Promise.all([
      this.documentRepository.find({
        where: { idPerson: personId },
        relations: ['documentType'],
      }),
      this.contactRepository.find({
        where: { idPerson: personId },
        relations: ['contactType'],
      }),
      this.addressRepository.find({ where: { idPerson: personId } }),
    ]);

    return {
      ...person,
      documents,
      contacts,
      addresses,
    };
  }

async updateProfile(personId: number, dto: UpdatePersonProfileDto) {
  const person = await this.personRepository.findOne({ where: { id: personId } });
  if (!person) {
    throw new NotFoundException('Persona no encontrada');
  }

  person.firstName = dto.firstName;
  person.secondName = dto.secondName || null;
  person.firstLastName = dto.firstLastName;
  person.secondLastName = dto.secondLastName || null;
  person.birthDate = dto.birthDate; // Guardar la cadena directamente

  return this.personRepository.save(person);
}

  async addDocument(personId: number, dto: AddDocumentDto) {
    const docType = await this.documentTypeRepository.findOne({
      where: { id: dto.idDocumentType },
    });
    if (!docType) {
      throw new NotFoundException('Tipo de documento inválido');
    }

    // Restricción: 1 documento por tipo por persona
    const existingForPerson = await this.documentRepository.findOne({
      where: {
        idPerson: personId,
        idDocumentType: dto.idDocumentType,
      },
    });
    if (existingForPerson) {
      throw new ConflictException('La persona ya posee un documento registrado de este tipo');
    }

    // Restricción: número de documento único por tipo
    const existingDoc = await this.documentRepository.findOne({
      where: {
        idDocumentType: dto.idDocumentType,
        documentNumber: dto.documentNumber,
      },
    });
    if (existingDoc) {
      throw new ConflictException('Este número de documento ya está registrado');
    }

    const document = this.documentRepository.create({
      idPerson: personId,
      idDocumentType: dto.idDocumentType,
      documentNumber: dto.documentNumber,
    });
    return this.documentRepository.save(document);
  }

  async addContact(personId: number, dto: AddContactDto) {
    const contactType = await this.contactTypeRepository.findOne({
      where: { id: dto.idContactType },
    });
    if (!contactType) {
      throw new NotFoundException('Tipo de contacto inválido');
    }

    const contact = this.contactRepository.create({
      idPerson: personId,
      idContactType: dto.idContactType,
      contactValue: dto.contactValue,
    });
    return this.contactRepository.save(contact);
  }

  async addAddress(personId: number, dto: AddAddressDto) {
    const address = this.addressRepository.create({
      idPerson: personId,
      streetAddress: dto.streetAddress,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country || 'Venezuela',
    });
    return this.addressRepository.save(address);
  }

  async getDocumentTypes() {
    return this.documentTypeRepository.find();
  }

  async getContactTypes() {
    return this.contactTypeRepository.find();
  }
}