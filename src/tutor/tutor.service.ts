import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common';
import { Tutor } from '@prisma/client';

@Injectable()
export class TutorService {

  constructor(
    private prismaService: PrismaService
  ) { }

  async checkDniAvailability(dni: string): Promise<{ available: boolean; tutor?: Tutor }> {
    const tutor = await this.prismaService.tutor.findUnique({
      where: { dni },
      include: { students: true }
    });
    return {
      available: !tutor,
      tutor: tutor || undefined,
    };
  }

  async create(createTutorDto: CreateTutorDto) {

    const { available } = await this.checkDniAvailability(createTutorDto.dni);
    if (!available) {
      throw new ConflictException('El tutor con este DNI ya existe.');
    }
    const emailExists = await this.prismaService.tutor.findUnique({
      where: { email: createTutorDto.email },
    });
    if (emailExists) {
      throw new ConflictException('El correo electrónico ya está en uso.');
    }
    return await this.prismaService.tutor.create({
      data: createTutorDto,
      include: { students: true },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    
    const totalPage = await this.prismaService.tutor.count(
      {
        where: { deletedAt: null }
      }
    );

    if(!limit) {
      const tutors = await this.prismaService.tutor.findMany({
        where: { deletedAt: null },
        include: { students: true }
      })
  
      return {
        meta: {
          total: totalPage,
          lastPage:1,
          page
        },
        data: tutors
      }
    }


    const lastPage = Math.ceil(totalPage / limit);

    const tutors = await this.prismaService.tutor.findMany({
      where: { deletedAt: null },
      take: limit,
      skip: (page - 1) * limit,
      include: { students: true }
    })

    return {
      meta: {
        total: totalPage,
        lastPage,
        page
      },
      data: tutors
    }
  }

  async findOne(id: string) {
    const tutor = await this.prismaService.tutor.findFirst(
      {
        where: {
          deletedAt: null,
          OR: [
            { dni: id },
            { id: id }
          ]
        },
        include: { students: true }
      }
    );
    if (!tutor) {
      throw new BadRequestException('El tutor no existe.');
    }
    return tutor;
  }

  async tutorSearch(query: string) {
    const result = await this.prismaService.tutor.findMany({
      where: {
        OR: [
          { dni: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } }
        ],
        deletedAt: null
      },
      include: {
        students: true,
      },
    });

    return result;
  }

  async update(id: string, updateTutorDto: UpdateTutorDto) {
    return await this.prismaService.tutor.update({
      where: { id },
      data: updateTutorDto,
      include: { students: true }
    });
  }

  async remove(id: string) {
    const tutor = await this.prismaService.student.findMany({
      where: { tutorId: id },
    });
    if (tutor.length > 0) {
      throw new BadRequestException('No se puede eliminar el tutor porque tiene estudiantes asociados.');
    }
    const existingTutor = await this.prismaService.tutor.findUnique({
      where: { id },
    });
    if (!existingTutor) {
      throw new NotFoundException(`Tutor con ID ${id} no encontrado`);
    }
    return await this.prismaService.tutor.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
