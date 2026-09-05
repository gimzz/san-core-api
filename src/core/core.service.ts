import { Injectable, HttpStatus } from '@nestjs/common';
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
import { HttpResponse } from 'src/utils/http-response.util';
import { TryCatch } from 'src/utils/try-catch.decorator';

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

  @TryCatch()
  async getPersonFullProfile(personId: number) {
    const person = await this.personRepository.findOne({
      where: { id: personId },
    });
    if (!person) {
      HttpResponse({ status: HttpStatus.NOT_FOUND, data: 'Persona no encontrada' });
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
      data: { ...person, documents, contacts, addresses },
      status: HttpStatus.OK,
    };
  }

  @TryCatch()
  async updateProfile(personId: number, dto: UpdatePersonProfileDto) {
    const person = await this.personRepository.findOne({ where: { id: personId } });
    if (!person) {
      HttpResponse({ status: HttpStatus.NOT_FOUND, data: 'Persona no encontrada' });
    }

    person.firstName = dto.firstName;
    person.secondName = dto.secondName || null;
    person.firstLastName = dto.firstLastName;
    person.secondLastName = dto.secondLastName || null;
    person.birthDate = dto.birthDate; // Guardar la cadena directamente

    const saved = await this.personRepository.save(person);
    return { data: saved, status: HttpStatus.OK };
  }

  @TryCatch()
  async addDocument(personId: number, dto: AddDocumentDto) {
    const docType = await this.documentTypeRepository.findOne({
      where: { id: dto.idDocumentType },
    });
    if (!docType) {
      HttpResponse({ status: HttpStatus.NOT_FOUND, data: 'Tipo de documento inválido' });
    }

    // Restricción: 1 documento por tipo por persona
    const existingForPerson = await this.documentRepository.findOne({
      where: {
        idPerson: personId,
        idDocumentType: dto.idDocumentType,
      },
    });
    if (existingForPerson) {
      HttpResponse({ status: HttpStatus.CONFLICT, data: 'La persona ya posee un documento registrado de este tipo' });
    }

    // Restricción: número de documento único por tipo
    const existingDoc = await this.documentRepository.findOne({
      where: {
        idDocumentType: dto.idDocumentType,
        documentNumber: dto.documentNumber,
      },
    });
    if (existingDoc) {
      HttpResponse({ status: HttpStatus.CONFLICT, data: 'Este número de documento ya está registrado' });
    }

    const document = this.documentRepository.create({
      idPerson: personId,
      idDocumentType: dto.idDocumentType,
      documentNumber: dto.documentNumber,
    });
    const saved = await this.documentRepository.save(document);
    return { data: saved, status: HttpStatus.CREATED };
  }

  @TryCatch()
  async addContact(personId: number, dto: AddContactDto) {
    const contactType = await this.contactTypeRepository.findOne({
      where: { id: dto.idContactType },
    });
    if (!contactType) {
      HttpResponse({ status: HttpStatus.NOT_FOUND, data: 'Tipo de contacto inválido' });
    }

    const contact = this.contactRepository.create({
      idPerson: personId,
      idContactType: dto.idContactType,
      contactValue: dto.contactValue,
    });
    const saved = await this.contactRepository.save(contact);
    return { data: saved, status: HttpStatus.CREATED };
  }

  @TryCatch()
  async addAddress(personId: number, dto: AddAddressDto) {
    const address = this.addressRepository.create({
      idPerson: personId,
      streetAddress: dto.streetAddress,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country || 'Venezuela',
    });
    const saved = await this.addressRepository.save(address);
    return { data: saved, status: HttpStatus.CREATED };
  }

  @TryCatch()
  async getDocumentTypes() {
    const types = await this.documentTypeRepository.find();
    return { data: types, status: HttpStatus.OK };
  }

  @TryCatch()
  async getContactTypes() {
    const types = await this.contactTypeRepository.find();
    return { data: types, status: HttpStatus.OK };
  }
}