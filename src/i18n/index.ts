import tr from "./tr.json";
import en from "./en.json";
import type { Locale } from "@/types";

const dictionaries = { tr, en };

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries.tr;
}

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<typeof tr>;

export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}
