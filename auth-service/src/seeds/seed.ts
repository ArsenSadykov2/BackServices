import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);

  const users = [
    { email: 'admin@test.com', password: 'admin123' },
    { email: 'user1@test.com', password: 'user123' },
    { email: 'user2@test.com', password: 'user123' },
  ];

  for (const userData of users) {
    try {
      const existingUser = await usersService.findByEmail(userData.email);
      if (existingUser) {
        console.log(`User ${userData.email} already exists`);
        continue;
      }

      const password_hash = await bcrypt.hash(userData.password, 10);
      await usersService.create(userData.email, password_hash);
      console.log(`Created user: ${userData.email}`);
    } catch (error) {
      console.log(`Error creating ${userData.email}:`, error.message);
    }
  }

  console.log('Users seeding completed!');
  await app.close();
}

bootstrap();
