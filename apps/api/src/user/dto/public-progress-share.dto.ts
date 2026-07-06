export class PublicProgressShareDto {
  id: string;
  earnedCount: number;
  totalCount: number;
  percent: number;
  topAchievements: Array<{
    id: string;
    title: string;
    rarity: string;
    icon: string;
  }>;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  };
}
