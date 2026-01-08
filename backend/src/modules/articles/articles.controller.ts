import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new article (Admin only)' })
  @ApiResponse({ status: 201, description: 'Article successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createArticleDto: CreateArticleDto) {
    const article = await this.articlesService.create(createArticleDto);
    return {
      id: article._id,
      title: article.title,
      domain: article.domain,
      difficulty: article.difficulty,
      wordCount: article.wordCount,
      scheduledFor: article.scheduledFor,
      createdAt: article.createdAt,
    };
  }

  @Get('today')
  @Public()
  @ApiOperation({ summary: 'Get today\'s article' })
  @ApiResponse({ status: 200, description: 'Today\'s article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No article available for today' })
  async getTodayArticle() {
    const article = await this.articlesService.getTodayArticle();
    return {
      id: article._id,
      title: article.title,
      domain: article.domain,
      difficulty: article.difficulty,
      content: article.content,
      wordCount: article.wordCount,
      readingMap: article.readingMap,
      keyParagraphs: article.keyParagraphs,
      languageBreakdown: article.languageBreakdown,
      understandingQuestions: article.understandingQuestions,
      metadata: article.metadata,
      publishedAt: article.publishedAt,
    };
  }

  @Get('history')
  @Public()
  @ApiOperation({ summary: 'Get article history with pagination' })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'domain', required: false, enum: ['AI', 'finance', 'economics', 'technology', 'sociology'] })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['beginner', 'intermediate', 'advanced'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  async findAll(@Query() query: QueryArticlesDto) {
    return this.articlesService.findAll(query);
  }

  @Get('statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get articles statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics() {
    return this.articlesService.getStatistics();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article found' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findOne(@Param('id') id: string) {
    const article = await this.articlesService.findOne(id);
    return {
      id: article._id,
      title: article.title,
      domain: article.domain,
      difficulty: article.difficulty,
      content: article.content,
      wordCount: article.wordCount,
      readingMap: article.readingMap,
      keyParagraphs: article.keyParagraphs,
      languageBreakdown: article.languageBreakdown,
      understandingQuestions: article.understandingQuestions,
      metadata: article.metadata,
      scheduledFor: article.scheduledFor,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  @Post(':id/process-ai')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Process article with LLM Agents (Admin only)',
    description: 'This will generate AI content including reading map, key paragraphs, language breakdown, and understanding questions. This is a long-running operation.',
  })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article processed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 500, description: 'LLM processing failed' })
  async processWithAI(@Param('id') id: string) {
    const article = await this.articlesService.processWithAI(id);
    return {
      id: article._id,
      title: article.title,
      readingMap: article.readingMap,
      keyParagraphs: article.keyParagraphs,
      languageBreakdown: article.languageBreakdown,
      understandingQuestions: article.understandingQuestions,
      domain: article.domain,
      difficulty: article.difficulty,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article (Admin only)' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    const article = await this.articlesService.update(id, updateArticleDto);
    return {
      id: article._id,
      title: article.title,
      domain: article.domain,
      difficulty: article.difficulty,
      scheduledFor: article.scheduledFor,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    };
  }

  @Patch(':id/schedule')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule article for publication (Admin only)' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article scheduled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async scheduleArticle(
    @Param('id') id: string,
    @Body('scheduledFor') scheduledFor: Date,
  ) {
    const article = await this.articlesService.scheduleArticle(id, scheduledFor);
    return {
      id: article._id,
      title: article.title,
      scheduledFor: article.scheduledFor,
      publishedAt: article.publishedAt,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete article (Admin only)' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 204, description: 'Article deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async remove(@Param('id') id: string) {
    await this.articlesService.remove(id);
  }
}
