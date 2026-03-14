/** 한국어 이름이 있으면 한국어, 없으면 일본어를 반환 */
export function displayName(nameKo: string | null | undefined, nameJp: string) {
  return nameKo || nameJp;
}

/** 쿼리 문자열이 비어있으면 true, 아니면 values 중 하나라도 포함하면 true */
export function matchesQuery(query: string, values: Array<string | null | undefined>) {
  if (!query) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(query));
}
