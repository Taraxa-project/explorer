export function extractBoolean(param, defaultValue) {
  switch (param) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return defaultValue;
  }
}

export function useClientQuery() {
  let search = '';
  if (typeof window !== 'undefined') {
    search = window?.location?.search;
  }
  return new URLSearchParams(search);
}
