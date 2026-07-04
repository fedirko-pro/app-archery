import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BowCategory } from './bow-category.entity';
import { Rule } from '../rule/rule.entity';
import { CreateBowCategoryDto } from './dto/create-bow-category.dto';
import { UpdateBowCategoryDto } from './dto/update-bow-category.dto';

@Injectable()
export class BowCategoryService {
  constructor(private readonly em: EntityManager) {}

  async create(createBowCategoryDto: CreateBowCategoryDto): Promise<BowCategory> {
    const rule = await this.em.findOne(Rule, {
      id: createBowCategoryDto.ruleId,
    });
    if (!rule) {
      throw new NotFoundException(`Rule with ID ${createBowCategoryDto.ruleId} not found`);
    }

    const existingBowCategory = await this.em.findOne(BowCategory, {
      code: createBowCategoryDto.code,
      rule: rule.id,
    });

    if (existingBowCategory) {
      throw new BadRequestException(
        `Bow category with code ${createBowCategoryDto.code} already exists for this rule`,
      );
    }

    const bowCategory = new BowCategory();
    Object.assign(bowCategory, createBowCategoryDto);
    bowCategory.rule = rule;

    await this.em.persistAndFlush(bowCategory);
    return bowCategory;
  }

  async findAll(ruleId?: string): Promise<BowCategory[]> {
    const where = ruleId ? { rule: { id: ruleId } } : {};
    return this.em.find(BowCategory, where, {
      orderBy: { code: 'ASC' },
      populate: ['rule'],
    });
  }

  async findOne(id: string): Promise<BowCategory> {
    const bowCategory = await this.em.findOne(
      BowCategory,
      { id },
      {
        populate: ['rule'],
      },
    );

    if (!bowCategory) {
      throw new NotFoundException(`Bow category with ID ${id} not found`);
    }

    return bowCategory;
  }

  async findByCode(code: string, ruleId?: string): Promise<BowCategory> {
    const where: Record<string, unknown> = { code };
    if (ruleId) where.rule = ruleId;

    const bowCategory = await this.em.findOne(BowCategory, where, {
      populate: ['rule'],
    });

    if (!bowCategory) {
      throw new NotFoundException(`Bow category with code ${code} not found`);
    }

    return bowCategory;
  }

  async update(id: string, updateBowCategoryDto: UpdateBowCategoryDto): Promise<BowCategory> {
    const bowCategory = await this.findOne(id);

    // If updating code or rule, check if (code, rule) pair is already taken
    const targetRuleId = updateBowCategoryDto.ruleId || bowCategory.rule.id;
    const targetCode = updateBowCategoryDto.code || bowCategory.code;

    if (targetCode !== bowCategory.code || targetRuleId !== bowCategory.rule.id) {
      const existingBowCategory = await this.em.findOne(BowCategory, {
        code: targetCode,
        rule: targetRuleId,
      });

      if (existingBowCategory) {
        throw new BadRequestException(
          `Bow category with code ${targetCode} already exists for this rule`,
        );
      }
    }

    // If updating ruleId, verify the rule exists
    if (updateBowCategoryDto.ruleId) {
      const rule = await this.em.findOne(Rule, {
        id: updateBowCategoryDto.ruleId,
      });
      if (!rule) {
        throw new NotFoundException(`Rule with ID ${updateBowCategoryDto.ruleId} not found`);
      }
      bowCategory.rule = rule;
    }

    Object.assign(bowCategory, updateBowCategoryDto);
    await this.em.flush();

    return bowCategory;
  }

  async remove(id: string): Promise<void> {
    const bowCategory = await this.em.findOne(BowCategory, { id });

    if (!bowCategory) {
      throw new NotFoundException(`Bow category with ID ${id} not found`);
    }

    await this.em.removeAndFlush(bowCategory);
  }
}
