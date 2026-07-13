import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PatrolController } from './patrol.controller';
import { PatrolService } from './patrol.service';
import { TournamentService } from './tournament.service';
import { PermissionsService } from '../auth/permissions.service';

describe('PatrolController generate-and-save', () => {
  let controller: PatrolController;
  let patrolService: {
    findByTournament: jest.Mock;
    remove: jest.Mock;
    generatePatrolsForTournament: jest.Mock;
    saveGeneratedPatrols: jest.Mock;
  };

  beforeEach(async () => {
    patrolService = {
      findByTournament: jest.fn(),
      remove: jest.fn(),
      generatePatrolsForTournament: jest.fn(),
      saveGeneratedPatrols: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatrolController],
      providers: [
        { provide: PatrolService, useValue: patrolService },
        {
          provide: TournamentService,
          useValue: { findById: jest.fn() },
        },
        {
          provide: PermissionsService,
          useValue: {
            canManagePatrols: jest.fn().mockReturnValue(true),
            canViewPatrols: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get(PatrolController);
  });

  it('returns 409 when patrols already exist without force', async () => {
    patrolService.findByTournament.mockResolvedValue([{ id: 'patrol-1' }]);

    await expect(controller.generateAndSavePatrols('tournament-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(patrolService.generatePatrolsForTournament).not.toHaveBeenCalled();
  });

  it('regenerates patrols when force=true', async () => {
    patrolService.findByTournament.mockResolvedValue([{ id: 'patrol-1' }]);
    patrolService.generatePatrolsForTournament.mockResolvedValue({
      patrols: [],
      stats: { totalParticipants: 0 },
    });
    patrolService.saveGeneratedPatrols.mockResolvedValue([{ id: 'patrol-2' }]);

    const result = await controller.generateAndSavePatrols('tournament-1', 'true');

    expect(patrolService.remove).toHaveBeenCalledWith('patrol-1');
    expect(patrolService.generatePatrolsForTournament).toHaveBeenCalledWith('tournament-1');
    expect(result.patrols).toEqual([{ id: 'patrol-2' }]);
  });
});
