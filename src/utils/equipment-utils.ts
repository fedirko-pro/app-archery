import type { LocalEquipmentSet } from './local-data-storage';

export const BOW_TYPES = ['bow', 'crossbow'] as const;

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
