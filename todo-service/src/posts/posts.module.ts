import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { AuthGuard } from '../guards/auth-guard';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), HttpModule, ConfigModule],
  controllers: [PostsController],
  providers: [PostsService, AuthGuard],
})
export class PostsModule {}
