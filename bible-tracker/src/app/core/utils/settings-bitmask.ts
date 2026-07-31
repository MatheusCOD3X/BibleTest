import { AppSettings } from '../../models/bible.models';

/**
 * Representa `AppSettings` de forma compacta, usando um bitmask (um número cujos bits
 * individuais guardam cada configuração). Fica guardado junto com o JSON que já existe
 * (não o substitui), permitindo também ler/escrever as configurações como um único
 * inteiro - útil para sincronização leve com um futuro backend/BFF, compartilhamento
 * via query string, ou comparações rápidas.
 *
 * Layout dos bits (do menos significativo para o mais significativo):
 *  bit 0        -> theme       (0 = light, 1 = dark)
 *  bits 1-2     -> fontFamily  (0 = inter, 1 = serif, 2 = mono)
 *  bits 3-10    -> fontSize    (valor bruto em px, 0-255)
 *  bit 11       -> animations  (0 = desligado, 1 = ligado)
 *  bits 12-13   -> language    (0 = pt-BR, 1 = en, 2 = es)
 */
export const SettingsBit = {
  THEME_DARK: 1 << 0,
  ANIMATIONS_ON: 1 << 11
} as const;

const FONT_FAMILY_SHIFT = 1;
const FONT_FAMILY_BITS = 0b11;
const FONT_SIZE_SHIFT = 3;
const FONT_SIZE_BITS = 0xff;
const LANGUAGE_SHIFT = 12;
const LANGUAGE_BITS = 0b11;

const FONT_FAMILY_TO_CODE: Record<AppSettings['fontFamily'], number> = { inter: 0, serif: 1, mono: 2 };
const CODE_TO_FONT_FAMILY: readonly AppSettings['fontFamily'][] = ['inter', 'serif', 'mono'];

const LANGUAGE_TO_CODE: Record<AppSettings['language'], number> = { 'pt-BR': 0, en: 1, es: 2 };
const CODE_TO_LANGUAGE: readonly AppSettings['language'][] = ['pt-BR', 'en', 'es'];

/** Empacota um objeto `AppSettings` em um único número inteiro (bitmask). */
export function encodeSettingsToBitmask(settings: AppSettings): number {
  let mask = 0;
  if (settings.theme === 'dark') {
    mask |= SettingsBit.THEME_DARK;
  }
  if (settings.animations) {
    mask |= SettingsBit.ANIMATIONS_ON;
  }
  // "<<" desloca os bits do valor para a posição reservada a ele (o "endereço" dentro
  // do número); "|=" liga esses bits no resultado sem apagar os bits já definidos acima.
  mask |= (FONT_FAMILY_TO_CODE[settings.fontFamily] ?? 0) << FONT_FAMILY_SHIFT;
  mask |= (settings.fontSize & FONT_SIZE_BITS) << FONT_SIZE_SHIFT;
  mask |= (LANGUAGE_TO_CODE[settings.language] ?? 0) << LANGUAGE_SHIFT;
  return mask;
}

/** Desempacota um bitmask de volta em `AppSettings`, usando `fallback` para qualquer bit que resulte em um valor desconhecido. */
export function decodeBitmaskFromSettings(mask: number, fallback: AppSettings): AppSettings {
  // ">>" desfaz o deslocamento feito na codificação, trazendo o valor de volta para a posição
  // 0; "&" (AND) então "recorta" só os bits daquele campo, zerando o restante do número.
  const fontFamilyCode = (mask >> FONT_FAMILY_SHIFT) & FONT_FAMILY_BITS;
  const fontSize = (mask >> FONT_SIZE_SHIFT) & FONT_SIZE_BITS;
  const languageCode = (mask >> LANGUAGE_SHIFT) & LANGUAGE_BITS;
  return {
    theme: (mask & SettingsBit.THEME_DARK) ? 'dark' : 'light',
    fontFamily: CODE_TO_FONT_FAMILY[fontFamilyCode] ?? fallback.fontFamily,
    fontSize: fontSize || fallback.fontSize,
    animations: (mask & SettingsBit.ANIMATIONS_ON) !== 0,
    language: CODE_TO_LANGUAGE[languageCode] ?? fallback.language
  };
}

/** Verifica se todos os bits de `flag` estão presentes (ligados) em `mask`. */
export function hasSettingsFlag(mask: number, flag: number): boolean {
  return (mask & flag) === flag;
}
