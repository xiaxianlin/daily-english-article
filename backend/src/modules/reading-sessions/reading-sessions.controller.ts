import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
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
import { ReadingSessionsService } from './reading-sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { SubmitUnderstandingDto } from './dto/submit-understanding.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('reading-sessions')
@Controller('reading-sessions')
export class ReadingSessionsController {
  constructor(private readonly readingSessionsService: ReadingSessionsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new reading session' })
  @ApiResponse({ status: 201, description: 'Session started successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@CurrentUser() user: CurrentUserData, @Body() createSessionDto: CreateSessionDto) {
    const session = await this.readingSessionsService.create(user.userId, createSessionDto);
    return {
      id: session._id,
      articleId: session.articleId,
      status: session.status,
      startedAt: session.startedAt,
      progress: session.progress,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s reading sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUser(@CurrentUser() user: CurrentUserData, @Param('status') status?: string) {
    return this.readingSessionsService.findByUser(user.userId, status);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s reading statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserStats(@CurrentUser() user: CurrentUserData) {
    return this.readingSessionsService.getUserStats(user.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reading session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session found' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    const session = await this.readingSessionsService.findOne(id);
    return {
      id: session._id,
      articleId: session.articleId,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      progress: session.progress,
      understandingAnswer: session.understandingAnswer,
      dailySummary: session.dailySummary,
      timeSpentMinutes: session.timeSpentMinutes,
    };
  }

  @Patch(':id/progress')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update reading session progress' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateProgress(@Param('id') id: string, @Body() updateProgressDto: UpdateProgressDto) {
    const session = await this.readingSessionsService.updateProgress(id, updateProgressDto);
    return {
      id: session._id,
      progress: session.progress,
    };
  }

  @Post(':id/understanding')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit understanding check answer' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async submitUnderstanding(
    @Param('id') id: string,
    @Body() submitUnderstandingDto: SubmitUnderstandingDto,
  ) {
    const session = await this.readingSessionsService.submitUnderstandingAnswer(
      id,
      submitUnderstandingDto,
    );
    return {
      id: session._id,
      understandingAnswer: session.understandingAnswer,
      progress: session.progress,
    };
  }

  @Post(':id/complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete reading session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async completeSession(@Param('id') id: string) {
    const session = await this.readingSessionsService.completeSession(id);
    return {
      id: session._id,
      status: session.status,
      completedAt: session.completedAt,
      timeSpentMinutes: session.timeSpentMinutes,
    };
  }

  @Post(':id/abandon')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Abandon reading session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session abandoned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async abandonSession(@Param('id') id: string) {
    const session = await this.readingSessionsService.abandonSession(id);
    return {
      id: session._id,
      status: session.status,
    };
  }
}
