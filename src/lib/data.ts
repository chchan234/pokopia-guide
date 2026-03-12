import 'server-only';
import siteData from '@/data/site-data.json';
import type {
  FashionCategory,
  Habitat,
  HumanRecord,
  MapSummary,
  Pokemon,
  SiteData,
  SpecialtyGroup,
} from '@/types/pokemon';

const data = siteData as SiteData;

export const stats = data.stats;
export const maps = data.maps as MapSummary[];
export const pokemon = data.pokemon as Pokemon[];
export const habitats = data.habitats as Habitat[];
export const specialties = data.specialties as SpecialtyGroup[];
export const humanRecords = data.records as HumanRecord[];
export const fashionCategories = data.fashionCategories as FashionCategory[];

export function getPokemonBySlug(slug: string): Pokemon | undefined {
  return pokemon.find((entry) => entry.slug === slug);
}

export function getHabitatById(id: string): Habitat | undefined {
  return habitats.find((entry) => entry.id === id);
}

export function getRecordById(id: number): HumanRecord | undefined {
  return humanRecords.find((entry) => entry.id === id);
}

export function getPokemonByHabitat(name: string): Pokemon[] {
  return pokemon.filter((entry) => entry.habitatNames.includes(name));
}

export function getPokemonBySpecialty(name: string): Pokemon[] {
  return pokemon.filter((entry) => entry.specialties.some((specialty) => specialty.nameKo === name));
}

export const allTypes = Array.from(
  new Set(pokemon.flatMap((entry) => entry.types.map((type) => type.nameKo)))
).sort((a, b) => a.localeCompare(b, 'ko'));

export const allSpecialties = Array.from(
  new Set(pokemon.flatMap((entry) => entry.specialties.map((specialty) => specialty.nameKo)))
).sort((a, b) => a.localeCompare(b, 'ko'));

export const allMapNames = Array.from(new Set(pokemon.map((entry) => entry.primaryMap))).sort((a, b) => a.localeCompare(b, 'ko'));
