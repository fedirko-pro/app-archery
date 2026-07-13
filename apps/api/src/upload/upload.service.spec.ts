import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { UploadService } from './upload.service';

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
    rm: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn(),
  },
}));

describe('UploadService', () => {
  let uploadService: UploadService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
      ],
    }).compile();

    uploadService = module.get(UploadService);
  });

  describe('assertSafePathSegment', () => {
    it('rejects path traversal segments', () => {
      expect(() => uploadService.assertSafePathSegment('../etc/passwd', 'filename')).toThrow(
        BadRequestException,
      );
      expect(() => uploadService.assertSafePathSegment('..', 'filename')).toThrow(
        BadRequestException,
      );
      expect(() => uploadService.assertSafePathSegment('foo/bar', 'filename')).toThrow(
        BadRequestException,
      );
      expect(() => uploadService.assertSafePathSegment('foo\\bar', 'filename')).toThrow(
        BadRequestException,
      );
    });

    it('rejects empty and special-character segments', () => {
      expect(() => uploadService.assertSafePathSegment('', 'filename')).toThrow(
        BadRequestException,
      );
      expect(() => uploadService.assertSafePathSegment('file name', 'filename')).toThrow(
        BadRequestException,
      );
      expect(() => uploadService.assertSafePathSegment('file;rm', 'filename')).toThrow(
        BadRequestException,
      );
    });

    it('accepts safe filenames', () => {
      expect(() =>
        uploadService.assertSafePathSegment('abc123_file-name.webp', 'filename'),
      ).not.toThrow();
    });
  });

  describe('deleteAttachment', () => {
    it('rejects traversal in tournamentId before touching the filesystem', async () => {
      await expect(uploadService.deleteAttachment('../secrets', 'safe-file.pdf')).rejects.toThrow(
        BadRequestException,
      );

      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('rejects traversal in filename before touching the filesystem', async () => {
      await expect(
        uploadService.deleteAttachment('tournament-1', '../../images/avatars/user.webp'),
      ).rejects.toThrow(BadRequestException);

      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('rejects encoded-style traversal patterns in filename', async () => {
      await expect(
        uploadService.deleteAttachment('tournament-1', '..%2F..%2Fpasswd'),
      ).rejects.toThrow(BadRequestException);

      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('deletes files only inside the tournament attachment directory', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await uploadService.deleteAttachment('tournament-1', 'attachment-id_report.pdf');

      expect(fs.unlink).toHaveBeenCalledTimes(1);
      const deletedPath = (fs.unlink as jest.Mock).mock.calls[0][0] as string;
      expect(deletedPath).toContain('uploads');
      expect(deletedPath).toContain('attachments');
      expect(deletedPath).toContain('tournament-1');
      expect(deletedPath).toContain('attachment-id_report.pdf');
      expect(deletedPath).not.toContain('..');
    });
  });
});
