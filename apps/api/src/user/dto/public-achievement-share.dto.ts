export class PublicAchievementShareDto {
  id: string;
  branch: 'onboarding' | 'discipline' | 'endurance' | 'fieldcraft' | 'arena';
  subtrack?: 'arrows' | 'sessions' | 'distance' | 'weight';
  tier: number;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  shareImage?: string;
  rarity: string;
  rarityHex: string;
  earned: boolean;
  earnedDate?: string | null;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  };
  badge512?: string;
  thumb256?: string;
  ogCard1200?: string;
}
