import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';

describe('PostsService', () => {
  let service: PostsService;

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
      };

      const userId = 1;

      const mockPost = {
        id: 1,
        ...createPostDto,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(createPostDto, userId);

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.create).toHaveBeenCalledWith({
        ...createPostDto,
        user_id: userId,
      });
      expect(mockPostRepository.save).toHaveBeenCalledWith(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content 1',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          title: 'Post 2',
          content: 'Content 2',
          user_id: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPostRepository.find.mockResolvedValue(mockPosts);

      const result = await service.findAll();

      expect(result).toEqual(mockPosts);
      expect(mockPostRepository.find).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post if user is owner', async () => {
      const updateDto = { title: 'Updated Title' };
      const userId = 1;

      const existingPost = {
        id: 1,
        title: 'Old Title',
        content: 'Content',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedPost = { ...existingPost, ...updateDto };

      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.save.mockResolvedValue(updatedPost);

      const result = await service.update(1, updateDto, userId);

      expect(result.title).toBe('Updated Title');
      expect(mockPostRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const updateDto = { title: 'Updated Title' };
      const userId = 2;

      const existingPost = {
        id: 1,
        title: 'Old Title',
        content: 'Content',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPostRepository.findOne.mockResolvedValue(existingPost);

      await expect(service.update(1, updateDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a post if user is owner', async () => {
      const userId = 1;

      const existingPost = {
        id: 1,
        title: 'Test Post',
        content: 'Content',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.remove.mockResolvedValue(existingPost);

      await service.remove(1, userId);

      expect(mockPostRepository.remove).toHaveBeenCalledWith(existingPost);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const userId = 2;

      const existingPost = {
        id: 1,
        title: 'Test Post',
        content: 'Content',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPostRepository.findOne.mockResolvedValue(existingPost);

      await expect(service.remove(1, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
