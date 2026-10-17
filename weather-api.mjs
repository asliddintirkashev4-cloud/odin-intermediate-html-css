export function normalizeWeather(data) {
  const current = data.currentConditions ?? data.days?.[0];
  if (!current || !Number.isFinite(current.temp) || !data.resolvedAddress) throw new Error('The weather response is incomplete.');
  return {
    location: data.resolvedAddress, timezone: data.timezone ?? '',
    temperature: current.temp, feelsLike: current.feelslike ?? current.temp,
    conditions: current.conditions ?? 'Unknown conditions', icon: current.icon ?? 'cloudy',
    humidity: current.humidity, wind: current.windspeed,
    days: (data.days ?? []).slice(0,5).map(day => ({date:day.datetime, high:day.tempmax, low:day.tempmin, conditions:day.conditions ?? ''})),
  };
}
export async function fetchWeather(location, apiKey, {fetcher = fetch, signal} = {}) {
  if (!location.trim() || !apiKey.trim()) throw new Error('Enter a location and your Visual Crossing API key.');
  const url = new URL(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location.trim())}`);
  url.search = new URLSearchParams({unitGroup:'metric', include:'current,days', contentType:'json', key:apiKey.trim()});
  const response = await fetcher(url.toString(), {signal});
  if (!response.ok) {
    if ([401,403].includes(response.status)) throw new Error('The API key was not accepted. Check your Visual Crossing account.');
    if (response.status === 429) throw new Error('The request limit was reached. Please try again later.');
    throw new Error(`Weather could not be loaded (HTTP ${response.status}). Check the location and try again.`);
  }
  return response.json();
}
export function temperature(value, unit) { return unit === 'F' ? value * 9 / 5 + 32 : value; }
export function weatherTheme(icon) {
  if (/rain|snow|sleet|thunder/.test(icon)) return 'rain';
  if (/night/.test(icon)) return 'night';
  return /clear/.test(icon) ? 'clear' : 'cloudy';
}
export const sampleWeather = {
  resolvedAddress:'Tashkent, Uzbekistan', timezone:'Asia/Tashkent',
  currentConditions:{temp:22, feelslike:21, conditions:'Partly cloudy', icon:'partly-cloudy-day', humidity:45, windspeed:12},
  days:[{datetime:'2026-10-17',tempmax:24,tempmin:12,conditions:'Partly cloudy'}, {datetime:'2026-10-18',tempmax:23,tempmin:11,conditions:'Clear'}, {datetime:'2026-10-19',tempmax:21,tempmin:10,conditions:'Cloudy'}],
};
