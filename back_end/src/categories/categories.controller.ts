import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionType } from '../common/enums/enum';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một danh mục mới' })
  @ApiResponse({ status: 201, description: 'Danh mục đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return category.toResponseFormat();
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục.' })
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return categories.map(category => category.toResponseFormat());
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Lấy danh mục theo loại' })
  @ApiParam({ name: 'type', enum: TransactionType, description: 'Loại danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục theo loại.' })
  async findByType(@Param('type') type: TransactionType) {
    const categories = await this.categoriesService.findByType(type);
    return categories.map(category => category.toResponseFormat());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin của một danh mục' })
  @ApiParam({ name: 'id', description: 'ID của danh mục' })
  @ApiResponse({ status: 200, description: 'Thông tin danh mục.' })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại.' })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return category.toResponseFormat();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật một danh mục' })
  @ApiParam({ name: 'id', description: 'ID của danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại.' })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return category.toResponseFormat();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một danh mục' })
  @ApiParam({ name: 'id', description: 'ID của danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại.' })
  @ApiResponse({ status: 409, description: 'Danh mục đang được sử dụng không thể xóa.' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
