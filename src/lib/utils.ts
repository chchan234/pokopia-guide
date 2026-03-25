/** 한국어 이름 반환. 없으면 빈 문자열 (일본어 표시 금지) */
export function displayName(nameKo: string | null | undefined, _nameJp: string) {
  return nameKo || '';
}

/** 쿼리 문자열이 비어있으면 true, 아니면 values 중 하나라도 포함하면 true */
export function matchesQuery(query: string, values: Array<string | null | undefined>) {
  if (!query) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(query));
}
