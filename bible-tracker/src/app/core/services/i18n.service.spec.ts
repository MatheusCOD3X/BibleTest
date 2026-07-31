import { TestBed } from '@angular/core/testing';
import { BibleBook } from '../../models/bible.models';
import { I18nService } from './i18n.service';
import { StorageService } from './storage.service';

const SAMPLE_BOOK: BibleBook = {
  id: 'gen',
  name: 'Gênesis',
  testament: 'Antigo',
  chapters: 50,
  abbreviation: 'Gn'
};

describe('I18nService', () => {
  let service: I18nService;
  let storageService: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
    storageService = TestBed.inject(StorageService);
  });

  it('starts with the default pt-BR dictionary', () => {
    expect(service.locale()).toBe('pt-BR');
    expect(service.t().common.home).toBe('Home');
    expect(service.t().settings.title).toBe('Configurações');
  });

  it('reacts to language changes made through StorageService (settingsSignal)', () => {
    storageService.updateSettings({ language: 'en' });
    expect(service.locale()).toBe('en');
    expect(service.t().settings.title).toBe('Settings');

    storageService.updateSettings({ language: 'es' });
    expect(service.locale()).toBe('es');
    expect(service.t().settings.title).toBe('Configuración');
  });

  it('falls back to the pt-BR dictionary when the stored language is unknown/invalid', () => {
    storageService.updateSettings({ language: 'xx' as any });
    expect(service.t().common.home).toBe('Home');
    expect(service.t().settings.title).toBe('Configurações');
  });

  it('translateBookName returns the original pt-BR name for pt-BR locale', () => {
    expect(service.translateBookName(SAMPLE_BOOK)).toBe('Gênesis');
  });

  it('translateBookName returns the mapped name for en/es locales, with fallback for unknown ids', () => {
    storageService.updateSettings({ language: 'en' });
    expect(service.translateBookName(SAMPLE_BOOK)).toBe('Genesis');

    storageService.updateSettings({ language: 'es' });
    expect(service.translateBookName(SAMPLE_BOOK)).toBe('Génesis');

    const unknownBook: BibleBook = { ...SAMPLE_BOOK, id: 'not-a-real-book' };
    expect(service.translateBookName(unknownBook)).toBe(unknownBook.name);
  });

  it('translateTestament returns the mapped label per locale', () => {
    expect(service.translateTestament('Antigo')).toBe('Antigo');
    expect(service.translateTestament('Novo')).toBe('Novo');

    storageService.updateSettings({ language: 'en' });
    expect(service.translateTestament('Antigo')).toBe('Old');
    expect(service.translateTestament('Novo')).toBe('New');

    storageService.updateSettings({ language: 'es' });
    expect(service.translateTestament('Antigo')).toBe('Antiguo');
    expect(service.translateTestament('Novo')).toBe('Nuevo');
  });
});
