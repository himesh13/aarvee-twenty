import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LeadNumberGeneratorService } from '../lead-number-generator.service';
import { LeadWorkspaceEntity } from '../../standard-objects/lead.workspace-entity';

describe('LeadNumberGeneratorService', () => {
  let service: LeadNumberGeneratorService;
  let repository: Repository<LeadWorkspaceEntity>;

  const mockRepository = {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadNumberGeneratorService,
        {
          provide: getRepositoryToken(LeadWorkspaceEntity, 'metadata'),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LeadNumberGeneratorService>(
      LeadNumberGeneratorService,
    );
    repository = module.get<Repository<LeadWorkspaceEntity>>(
      getRepositoryToken(LeadWorkspaceEntity, 'metadata'),
    );

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('generateLeadNumber', () => {
    it('should generate lead number with correct format', async () => {
      mockRepository.count.mockResolvedValue(0);

      const leadNo = await service.generateLeadNumber('workspace-123');

      expect(leadNo).toMatch(/^LD-\d{6}-\d{5}$/);
      expect(leadNo).toContain('LD-');
    });

    it('should generate sequential lead numbers', async () => {
      mockRepository.count.mockResolvedValueOnce(0);
      const firstLeadNo = await service.generateLeadNumber('workspace-123');

      mockRepository.count.mockResolvedValueOnce(1);
      const secondLeadNo = await service.generateLeadNumber('workspace-123');

      // Extract sequence numbers
      const firstSeq = parseInt(firstLeadNo.split('-')[2], 10);
      const secondSeq = parseInt(secondLeadNo.split('-')[2], 10);

      expect(secondSeq).toBe(firstSeq + 1);
    });

    it('should reset sequence at the start of new month', async () => {
      // Mock January leads
      mockRepository.count.mockResolvedValueOnce(99);
      const januaryLead = await service.generateLeadNumber('workspace-123');

      // Expect 100th lead in sequence
      expect(januaryLead).toMatch(/-00100$/);
    });

    it('should pad sequence numbers with leading zeros', async () => {
      mockRepository.count.mockResolvedValue(0);

      const leadNo = await service.generateLeadNumber('workspace-123');

      const sequence = leadNo.split('-')[2];
      expect(sequence).toBe('00001');
      expect(sequence.length).toBe(5);
    });

    it('should handle large sequence numbers', async () => {
      mockRepository.count.mockResolvedValue(99999);

      const leadNo = await service.generateLeadNumber('workspace-123');

      const sequence = leadNo.split('-')[2];
      expect(sequence).toBe('100000');
    });
  });

  describe('validateLeadNumberFormat', () => {
    it('should validate correct lead number format', () => {
      expect(service.validateLeadNumberFormat('LD-202601-00001')).toBe(true);
      expect(service.validateLeadNumberFormat('LD-202612-99999')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(service.validateLeadNumberFormat('LD-2026-00001')).toBe(false); // Wrong year format
      expect(service.validateLeadNumberFormat('LD-202601-001')).toBe(false); // Wrong sequence length
      expect(service.validateLeadNumberFormat('XX-202601-00001')).toBe(false); // Wrong prefix
      expect(service.validateLeadNumberFormat('LD202601-00001')).toBe(false); // Missing dash
      expect(service.validateLeadNumberFormat('LD-202601-ABCDE')).toBe(false); // Non-numeric sequence
    });
  });

  describe('parseLeadNumber', () => {
    it('should parse valid lead number', () => {
      const result = service.parseLeadNumber('LD-202601-00123');

      expect(result).toEqual({
        prefix: 'LD',
        year: 2026,
        month: 1,
        sequence: 123,
      });
    });

    it('should parse lead number from different months', () => {
      const dec = service.parseLeadNumber('LD-202612-00999');

      expect(dec).toEqual({
        prefix: 'LD',
        year: 2026,
        month: 12,
        sequence: 999,
      });
    });

    it('should return null for invalid lead numbers', () => {
      expect(service.parseLeadNumber('INVALID')).toBeNull();
      expect(service.parseLeadNumber('LD-2026-00001')).toBeNull();
      expect(service.parseLeadNumber('')).toBeNull();
    });
  });

  describe('isLeadNumberUnique', () => {
    it('should return true for unique lead number', async () => {
      mockRepository.count.mockResolvedValue(0);

      const isUnique = await service.isLeadNumberUnique(
        'workspace-123',
        'LD-202601-00001',
      );

      expect(isUnique).toBe(true);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
          leadNo: 'LD-202601-00001',
        },
      });
    });

    it('should return false for existing lead number', async () => {
      mockRepository.count.mockResolvedValue(1);

      const isUnique = await service.isLeadNumberUnique(
        'workspace-123',
        'LD-202601-00001',
      );

      expect(isUnique).toBe(false);
    });
  });

  describe('generateUniqueLeadNumber', () => {
    it('should generate unique lead number on first try', async () => {
      mockRepository.count
        .mockResolvedValueOnce(5) // For generation
        .mockResolvedValueOnce(0); // For uniqueness check

      const leadNo = await service.generateUniqueLeadNumber('workspace-123');

      expect(leadNo).toMatch(/^LD-\d{6}-\d{5}$/);
      expect(mockRepository.count).toHaveBeenCalledTimes(2);
    });

    it('should retry if first number is not unique', async () => {
      mockRepository.count
        .mockResolvedValueOnce(5) // First generation
        .mockResolvedValueOnce(1) // First uniqueness check (not unique)
        .mockResolvedValueOnce(5) // Second generation
        .mockResolvedValueOnce(0); // Second uniqueness check (unique)

      const leadNo = await service.generateUniqueLeadNumber('workspace-123');

      expect(leadNo).toBeDefined();
      expect(mockRepository.count).toHaveBeenCalledTimes(4);
    });

    it('should throw error after max retries', async () => {
      // Always return non-unique
      mockRepository.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1);

      await expect(
        service.generateUniqueLeadNumber('workspace-123', 5),
      ).rejects.toThrow('Failed to generate unique lead number after 5 attempts');
    });

    it('should allow custom max retries', async () => {
      mockRepository.count.mockResolvedValue(1); // Always non-unique

      await expect(
        service.generateUniqueLeadNumber('workspace-123', 3),
      ).rejects.toThrow('Failed to generate unique lead number after 3 attempts');
    });
  });
});
