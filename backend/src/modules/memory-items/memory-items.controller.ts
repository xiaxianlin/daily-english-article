import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MemoryItemsService } from './memory-items.service';
import { CreateMemoryItemDto } from './dto/create-memory-item.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('memory-items')
@Controller('memory-items')
export class MemoryItemsController {
  constructor(private readonly memoryItemsService: MemoryItemsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to memory bank' })
  @ApiResponse({ status: 201, description: 'Memory item added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@CurrentUser() user: CurrentUserData, @Body() createMemoryItemDto: CreateMemoryItemDto) {
    const memoryItem = await this.memoryItemsService.create(user.userId, createMemoryItemDto);
    return {
      id: memoryItem._id,
      type: memoryItem.type,
      content: memoryItem.content,
      context: memoryItem.context,
      reviewCount: memoryItem.reviewCount,
      masteryLevel: memoryItem.masteryLevel,
      createdAt: memoryItem.createdAt,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s memory bank' })
  @ApiResponse({ status: 200, description: 'Memory items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUser(@CurrentUser() user: CurrentUserData, @Param('type') type?: string) {
    return this.memoryItemsService.findByUser(user.userId, type);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get memory statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserStats(@CurrentUser() user: CurrentUserData) {
    return this.memoryItemsService.getUserStats(user.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get memory item by ID' })
  @ApiParam({ name: 'id', description: 'Memory item ID' })
  @ApiResponse({ status: 200, description: 'Memory item found' })
  @ApiResponse({ status: 404, description: 'Memory item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    const memoryItem = await this.memoryItemsService.findOne(id);
    return {
      id: memoryItem._id,
      type: memoryItem.type,
      content: memoryItem.content,
      context: memoryItem.context,
      sourceArticleId: memoryItem.sourceArticleId,
      reviewCount: memoryItem.reviewCount,
      masteryLevel: memoryItem.masteryLevel,
      lastReviewedAt: memoryItem.lastReviewedAt,
      createdAt: memoryItem.createdAt,
    };
  }

  @Post(':id/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark memory item as reviewed (for spaced repetition)' })
  @ApiParam({ name: 'id', description: 'Memory item ID' })
  @ApiResponse({ status: 200, description: 'Item marked as reviewed' })
  @ApiResponse({ status: 404, description: 'Memory item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async incrementReviewCount(@Param('id') id: string) {
    const memoryItem = await this.memoryItemsService.incrementReviewCount(id);
    return {
      id: memoryItem._id,
      reviewCount: memoryItem.reviewCount,
      masteryLevel: memoryItem.masteryLevel,
      lastReviewedAt: memoryItem.lastReviewedAt,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete memory item' })
  @ApiParam({ name: 'id', description: 'Memory item ID' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memory item not found' })
  async remove(@Param('id') id: string) {
    await this.memoryItemsService.remove(id);
  }
}
