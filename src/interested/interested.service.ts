import { Injectable } from '@nestjs/common';
import { CreateInterestedDto } from './dto/create-interested.dto';
import { UpdateInterestedDto } from './dto/update-interested.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InterestedService {
  constructor(
    private readonly prismaService: PrismaService, // Inject PrismaService to interact with the database
  ) {}

  async create(createInterestedDto: CreateInterestedDto) {
    // const data = this.prismaService.interested.create({
    //   data: createInterestedDto,
    // }); 
     
    return 'This action adds a new interested';
  }

  findAll() {
    return `This action returns all interested`;
  }

  findOne(id: number) {
    return `This action returns a #${id} interested`;
  }

  update(id: number, updateInterestedDto: UpdateInterestedDto) {
    return `This action updates a #${id} interested`;
  }

  remove(id: number) {
    return `This action removes a #${id} interested`;
  }
}
