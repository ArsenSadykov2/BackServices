import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Post } from '../posts/entities/post.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  const postRepository = dataSource.getRepository(Post);

  const posts = [
    { title: 'First Post', content: 'This is the first test post', user_id: 1 },
    { title: 'Second Post', content: 'Another test post', user_id: 1 },
    { title: 'Admin Post', content: 'Post by admin', user_id: 1 },
    { title: 'User1 Post', content: 'Post by user1', user_id: 2 },
    { title: 'User1 Second', content: 'Another post by user1', user_id: 2 },
    { title: 'User2 Post', content: 'Post by user2', user_id: 3 },
    { title: 'Docker Post', content: 'Testing Docker deployment', user_id: 1 },
    { title: 'NestJS Guide', content: 'Learning NestJS', user_id: 2 },
    { title: 'TypeORM Tips', content: 'Working with TypeORM', user_id: 3 },
    { title: 'Final Post', content: 'Last test post', user_id: 1 },
  ];

  for (const postData of posts) {
    try {
      const post = postRepository.create(postData);
      await postRepository.save(post);
      console.log(`Created post: "${postData.title}"`);
    } catch (error) {
      console.log(`Error creating post:`, error.message);
    }
  }

  console.log('Posts seeding completed!');
  await app.close();
}

bootstrap();
