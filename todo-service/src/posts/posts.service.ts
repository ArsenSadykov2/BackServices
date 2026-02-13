import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    this.logger.log(`Creating post for user ${userId}`);

    const post = this.postsRepository.create({
      ...createPostDto,
      user_id: userId,
    });

    const savedPost = await this.postsRepository.save(post);
    this.logger.log(`Post created: ID ${savedPost.id}`);

    return savedPost;
  }

  async findAll(): Promise<Post[]> {
    this.logger.log('Fetching all posts');
    return this.postsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    this.logger.log(`Fetching post with ID ${id}`);

    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      this.logger.warn(`Post with ID ${id} not found`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ): Promise<Post> {
    this.logger.log(`Updating post ${id} by user ${userId}`);

    const post = await this.findOne(id);

    if (post.user_id !== userId) {
      this.logger.warn(
        `User ${userId} attempted to update post ${id} owned by user ${post.user_id}`,
      );
      throw new ForbiddenException('You can only update your own posts');
    }

    Object.assign(post, updatePostDto);
    const updatedPost = await this.postsRepository.save(post);

    this.logger.log(`Post ${id} updated successfully`);
    return updatedPost;
  }

  async remove(id: number, userId: number): Promise<void> {
    this.logger.log(`Deleting post ${id} by user ${userId}`);

    const post = await this.findOne(id);

    if (post.user_id !== userId) {
      this.logger.warn(
        `User ${userId} attempted to delete post ${id} owned by user ${post.user_id}`,
      );
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postsRepository.remove(post);
    this.logger.log(`Post ${id} deleted successfully`);
  }
}
