import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { UserOutputsService } from './user-outputs.service';
import { CreateUserOutputDto } from './dto/create-user-output.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('user-outputs')
@Controller('user-outputs')
export class UserOutputsController {
  constructor(private readonly userOutputsService: UserOutputsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit professional output',
    description: 'Submit user output and trigger AI feedback generation',
  })
  @ApiResponse({ status: 201, description: 'Output submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@CurrentUser() user: CurrentUserData, @Body() createUserOutputDto: CreateUserOutputDto) {
    const userOutput = await this.userOutputsService.create(user.userId, createUserOutputDto);

    // Generate AI feedback asynchronously (could be moved to background job)
    try {
      const outputWithFeedback = await this.userOutputsService.generateFeedback(userOutput._id.toString());

      return {
        id: outputWithFeedback._id,
        userOutput: outputWithFeedback.userOutput,
        aiFeedback: outputWithFeedback.aiFeedback,
        feedbackGeneratedAt: outputWithFeedback.feedbackGeneratedAt,
      };
    } catch (error) {
      // Return the output even if feedback generation fails
      return {
        id: userOutput._id,
        userOutput: userOutput.userOutput,
        feedbackPending: true,
        error: 'AI feedback generation failed',
      };
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s outputs' })
  @ApiResponse({ status: 200, description: 'Outputs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUser(@CurrentUser() user: CurrentUserData, @Param('articleId') articleId?: string) {
    return this.userOutputsService.findByUser(user.userId, articleId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user output by ID' })
  @ApiParam({ name: 'id', description: 'Output ID' })
  @ApiResponse({ status: 200, description: 'Output found' })
  @ApiResponse({ status: 404, description: 'Output not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    const userOutput = await this.userOutputsService.findOne(id);
    return {
      id: userOutput._id,
      prompt: userOutput.prompt,
      userOutput: userOutput.userOutput,
      submittedAt: userOutput.submittedAt,
      aiFeedback: userOutput.aiFeedback,
      feedbackGeneratedAt: userOutput.feedbackGeneratedAt,
    };
  }

  @Get(':id/feedback')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI feedback for user output' })
  @ApiParam({ name: 'id', description: 'Output ID' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Output or feedback not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFeedback(@Param('id') id: string) {
    const userOutput = await this.userOutputsService.getFeedback(id);
    return {
      id: userOutput._id,
      aiFeedback: userOutput.aiFeedback,
    };
  }
}
