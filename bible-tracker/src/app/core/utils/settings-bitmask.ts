import { AppSettings } from '../../models/bible.models';

/**
 * Compact bit-field representation of `AppSettings`.
 * Stored alongside the existing JSON blob (not replacing it) so the settings
 * can also be read/written as a single integer - handy for lightweight sync
 * with a future backend/BFF, query-string sharing, or quick comparisons.
 *
 * Bit layout (LSB first):
 *  bit 0        -> theme       (0 = light, 1 = dark)
 *  bits 1-2     -> fontFamily  (0 = inter, 1 = serif, 2 = mono)
 *  bits 3-10    -> fontSize    (raw px value, 0-255)
 *  bit 11       -> animations  (0 = off, 1 = on)
 *  bit 12       -> language    (0 = pt-BR, 1 = en)
 */
export const SettingsBit = {
  THEME_DARK: 1 << 0,
  ANIMATIONS_ON: 1 << 11,
  LANGUAGE_EN: 1 << 12
} as const;

const FONT_FAMILY_SHIFT = 1;
const FONT_FAMILY_BITS = 0b11;
const FONT_SIZE_SHIFT = 3;
const FONT_SIZE_BITS = 0xff;

const FONT_FAMILY_TO_CODE: Record<AppSettings['fontFamily'], number> = { inter: 0, serif: 1, mono: 2 };
const CODE_TO_FONT_FAMILY: readonly AppSettings['fontFamily'][] = ['inter', 'serif', 'mono'];

/** Packs an `AppSettings` object into a single integer bitmask. */
export function encodeSettingsToBitmask(settings: AppSettings): number {
  let mask = 0;
  if (settings.theme === 'dark') {
    mask |= SettingsBit.THEME_DARK;
  }
  if (settings.animations) {
    mask |= SettingsBit.ANIMATIONS_ON;
  }
  if (settings.language === 'en') {
    mask |= SettingsBit.LANGUAGE_EN;
  }
  mask |= (FONT_FAMILY_TO_CODE[settings.fontFamily] ?? 0) << FONT_FAMILY_SHIFT;
  mask |= (settings.fontSize & FONT_SIZE_BITS) << FONT_SIZE_SHIFT;
  return mask;
}

/** Unpacks a bitmask back into `AppSettings`, using `fallback` for any bits that decode to an unknown value. */
export function decodeBitmaskFromSettings(mask: number, fallback: AppSettings): AppSettings {
  const fontFamilyCode = (mask >> FONT_FAMILY_SHIFT) & FONT_FAMILY_BITS;
  const fontSize = (mask >> FONT_SIZE_SHIFT) & FONT_SIZE_BITS;
  return {
    theme: (mask & SettingsBit.THEME_DARK) ? 'dark' : 'light',
    fontFamily: CODE_TO_FONT_FAMILY[fontFamilyCode] ?? fallback.fontFamily,
    fontSize: fontSize || fallback.fontSize,
    animations: (mask & SettingsBit.ANIMATIONS_ON) !== 0,
    language: (mask & SettingsBit.LANGUAGE_EN) ? 'en' : 'pt-BR'
  };
}

/** Checks whether every bit in `flag` is set in `mask`. */
export function hasSettingsFlag(mask: number, flag: number): boolean {
  return (mask & flag) === flag;
}
