export function findGIF(term, apiKey, fetcher = fetch) {
  if (!apiKey.trim() || !term.trim()) return Promise.reject(new Error('Enter a search term and your GIPHY API key.'));
  const url = new URL('https://api.giphy.com/v1/gifs/random');
  url.search = new URLSearchParams({api_key:apiKey.trim(),tag:term.trim(),rating:'g'});
  return fetcher(url.toString()).then(response => {
    if (!response.ok) throw new Error(`GIPHY request failed (HTTP ${response.status}). Check your key and try again.`);
    return response.json();
  }).then(response => {
    const image = response.data?.images?.original;
    if (!image?.url) throw new Error('No GIF was found. Try another search.');
    const imageURL = new URL(image.url);
    if (imageURL.protocol !== 'https:') throw new Error('The image URL was not secure.');
    return {url:imageURL.href,title:response.data.title || `${term} GIF`};
  });
}
