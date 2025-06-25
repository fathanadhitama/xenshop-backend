import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';

@Controller('package')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  async create(@Body() createPackageDto: CreatePackageDto) {
    const pkg = await this.packageService.create(createPackageDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Package created successfully',
      data: pkg,
    };
  }

  @Get()
  async findAll() {
    const pkgs = await this.packageService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Packages retrieved successfully',
      data: pkgs,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const pkg = await this.packageService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Package retrieved successfully',
      data: pkg,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.packageService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Package deleted successfully',
      data: result,
    };
  }
}
