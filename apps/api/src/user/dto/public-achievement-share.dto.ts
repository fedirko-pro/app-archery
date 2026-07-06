export class PublicAchievementShareDto {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  rarity: string;
  earned: boolean;
  earnedDate?: string | null;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  };
}
