import absoluteUrl from 'next-absolute-url';
import useSwr from 'swr';

export function useApiFromServer({ req }) {
  const { origin } = absoluteUrl(req);
  return async (url) => {
    const result = await fetch(`${origin}/${url}`);
    const { status } = result;
    if (status >= 200 && status < 300) {
      const data = await result.json();
      return { error: false, data, status };
    } else {
      return { error: true, data: null, status };
    }
  };
}

export function useApiFromClient(url) {
  return useSwr(url, (url) => fetch(url).then((res) => res.json()));
}
