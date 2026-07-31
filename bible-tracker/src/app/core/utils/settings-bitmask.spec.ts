import { AppSettings } from '../../models/bible.models';
import { decodeBitmaskFromSettings, encodeSettingsToBitmask, hasSettingsFlag, SettingsBit } from './settings-bitmask';

const DEFAULTS: AppSettings = {
  theme: 'light',
  fontFamily: 'inter',
  fontSize: 16,
  animations: true,
  language: 'pt-BR'
};

describe('settings-bitmask', () => {
  it('round-trips every settings combination through encode/decode', () => {
    const combinations: AppSettings[] = [
      DEFAULTS,
      { theme: 'dark', fontFamily: 'serif', fontSize: 20, animations: false, language: 'en' },
      { theme: 'dark', fontFamily: 'mono', fontSize: 14, animations: true, language: 'pt-BR' },
      { theme: 'light', fontFamily: 'mono', fontSize: 18, animations: false, language: 'en' },
      { theme: 'light', fontFamily: 'serif', fontSize: 22, animations: true, language: 'es' }
    ];

    for (const settings of combinations) {
      const mask = encodeSettingsToBitmask(settings);
      expect(decodeBitmaskFromSettings(mask, DEFAULTS)).toEqual(settings);
    }
  });

  it('sets and clears the expected individual bits', () => {
    const mask = encodeSettingsToBitmask({ ...DEFAULTS, theme: 'dark', animations: false, language: 'en' });
    expect(hasSettingsFlag(mask, SettingsBit.THEME_DARK)).toBe(true);
    expect(hasSettingsFlag(mask, SettingsBit.ANIMATIONS_ON)).toBe(false);
  });

  it('encodes each language into its own 2-bit code and decodes it back', () => {
    for (const language of ['pt-BR', 'en', 'es'] as const) {
      const mask = encodeSettingsToBitmask({ ...DEFAULTS, language });
      expect(decodeBitmaskFromSettings(mask, DEFAULTS).language).toBe(language);
    }
  });

  it('falls back to the provided defaults for an unknown fontFamily code', () => {
    const mask = 0b11 << 1; // código 3 de fontFamily não corresponde a nenhum valor mapeado
    const decoded = decodeBitmaskFromSettings(mask, DEFAULTS);
    expect(decoded.fontFamily).toBe(DEFAULTS.fontFamily);
  });
});
