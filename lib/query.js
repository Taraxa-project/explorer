export default function useQuery() {
  let search = '';
  if (typeof window !== 'undefined') {
    search = window?.location?.search;
  }
  return new URLSearchParams(search);
}
