import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateFederationDto } from './dto/create-federation.dto';
import type { UpdateFederationDto } from './dto/update-federation.dto';
import { Federation, FederationVisibility } from './federation.entity';

@Injectable()
export class FederationService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateFederationDto): Promise<Federation> {
    const federation = new Federation();
    Object.assign(federation, dto);
    await this.em.persistAndFlush(federation);
    return federation;
  }

  async findAll(options?: {
    country?: string;
    visibility?: string;
    search?: string;
  }): Promise<Federation[]> {
    const where: FilterQuery<Federation> = {};

    if (options?.country) {
      where.country = options.country;
    }

    if (options?.visibility === 'public') {
      where.visibility = FederationVisibility.PUBLIC;
    }

    if (options?.search) {
      where.name = { $ilike: `%${options.search}%` };
    }

    return this.em.find(Federation, where, { orderBy: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Federation> {
    const federation = await this.em.findOne(Federation, { id });
    if (!federation) {
      throw new NotFoundException(`Federation with ID ${id} not found`);
    }
    return federation;
  }

  async update(id: string, dto: UpdateFederationDto): Promise<Federation> {
    const federation = await this.findOne(id);
    Object.assign(federation, dto);
    await this.em.flush();
    return federation;
  }

  async remove(id: string): Promise<void> {
    const federation = await this.findOne(id);
    await this.em.removeAndFlush(federation);
  }
}
