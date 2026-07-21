import type { LocalEquipmentSet } from './local-data-storage';

export const BOW_TYPES = ['bow', 'crossbow'] as const;

export const ARROW_MATERIALS = [
  'wood',
  'carbon',
  'fiberglass',
  'aluminium',
  'mix',
  'custom',
] as const;

export type ArrowMaterial = (typeof ARROW_MATERIALS)[number];

const PRESET_ARROW_MATERIALS = ARROW_MATERIALS.filter((m) => m !== 'custom');

/** Split stored material into select preset + optional custom text. */
export function resolveArrowMaterialFormState(stored?: string): {
  preset: string;
  custom: string;
} {
  if (!stored) return { preset: '', custom: '' };
  if ((PRESET_ARROW_MATERIALS as readonly string[]).includes(stored)) {
    return { preset: stored, custom: '' };
  }
  return { preset: 'custom', custom: stored === 'custom' ? '' : stored };
}

/** Persist select + custom text back to a single arrowMaterial value. */
export function serializeArrowMaterial(preset: string, custom: string): string | undefined {
  if (!preset) return undefined;
  if (preset === 'custom') {
    const trimmed = custom.trim();
    return trimmed || undefined;
  }
  return preset;
}

/** True if value is a known preset key (not free-text custom). */
export function isPresetArrowMaterial(value: string | undefined): value is ArrowMaterial {
  return !!value && (PRESET_ARROW_MATERIALS as readonly string[]).includes(value);
}

export const DISMISSED_BOW_SETUP_PROMPT_KEY = 'dismissedBowSetupPrompt';
export const DEFAULT_EQUIPMENT_SET_ID_KEY = 'sokil_default_equipment_set_id';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** True if the user dismissed the prompt earlier today. Resets each calendar day. */
export function isBowSetupPromptDismissed(): boolean {
  const dismissedOn = localStorage.getItem(DISMISSED_BOW_SETUP_PROMPT_KEY);
  return dismissedOn === getTodayDateString();
}

/** Hide the prompt until tomorrow (while equipment sets remain empty). */
export function dismissBowSetupPrompt(): void {
  localStorage.setItem(DISMISSED_BOW_SETUP_PROMPT_KEY, getTodayDateString());
}

export function getDefaultEquipmentSetId(): string | null {
  return localStorage.getItem(DEFAULT_EQUIPMENT_SET_ID_KEY);
}

export function setDefaultEquipmentSetId(id: string | null): void {
  if (id) {
    localStorage.setItem(DEFAULT_EQUIPMENT_SET_ID_KEY, id);
  } else {
    localStorage.removeItem(DEFAULT_EQUIPMENT_SET_ID_KEY);
  }
}

/** Returns the local equipment set id if the stored default still exists. */
export function resolveDefaultEquipmentSetId(sets: LocalEquipmentSet[]): string | null {
  const stored = getDefaultEquipmentSetId();
  if (!stored) return null;
  const set = resolveEquipmentSet(stored, sets) ?? sets.find((s) => s.id === stored);
  return set?.id ?? null;
}

export function resolveEquipmentSet(
  equipmentSetId: string | undefined,
  sets: LocalEquipmentSet[],
): LocalEquipmentSet | undefined {
  if (!equipmentSetId) return undefined;
  return sets.find((s) => s.id === equipmentSetId || s.serverId === equipmentSetId);
}

export function getEquipmentSetName(
  equipmentSetId: string | undefined,
  sets: LocalEquipmentSet[],
): string | undefined {
  return resolveEquipmentSet(equipmentSetId, sets)?.name;
}
