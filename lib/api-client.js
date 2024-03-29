import absoluteUrl from 'next-absolute-url';
import useSwr from 'swr';

export async function fetchApi(url) {
  const result = await fetch(url);
  const { status } = result;
  if (status >= 200 && status < 300) {
    const data = await result.json();
    return { error: false, data, status };
  } else {
    return { error: true, data: null, status };
  }
}

export function useApiFromServer({ req }) {
  const { origin } = absoluteUrl(req);
  return async (url) => await fetchApi(`${origin}/${url}`);
}

export function useApiFromClient(url) {
  return useSwr(url, (url) => fetch(url).then((res) => res.json()));
}
