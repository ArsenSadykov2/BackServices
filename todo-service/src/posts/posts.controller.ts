import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  ValidationPipe,
  ParseIntPipe,
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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { AuthGuard } from '../guards/auth-guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new post (requires authentication)' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body(ValidationPipe) createPostDto: CreatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 200,
    description: 'List of all posts',
    type: [PostEntity],
  })
  async findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post found', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post (only owner)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post updated', type: PostEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updatePostDto: UpdatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete post (only owner)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 204, description: 'Post deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<void> {
    return this.postsService.remove(id, req.user.userId);
  }
}
