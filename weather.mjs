import {fetchWeather, normalizeWeather, temperature, weatherTheme, sampleWeather} from './weather-api.mjs';
const form = document.querySelector('#search-form');
const status = document.querySelector('#status');
let weather = null;
let unit = 'C';
let sample = false;
let request;
function degrees(value) { return `${Math.round(temperature(value,unit))}°${unit}`; }
function render() {
  if (!weather) return;
  document.body.dataset.theme = weatherTheme(weather.icon);
  document.querySelector('#weather').hidden = false;
  document.querySelector('#source').textContent = sample ? 'Sample weather · example data, not a live forecast' : 'Live forecast · Visual Crossing';
  document.querySelector('#place').textContent = weather.location;
  document.querySelector('#condition').textContent = weather.conditions;
  document.querySelector('#zone').textContent = weather.timezone;
  document.querySelector('#temp').textContent = degrees(weather.temperature);
  document.querySelector('#feels').textContent = `Feels like ${degrees(weather.feelsLike)}`;
  document.querySelector('#details').textContent = `Humidity ${weather.humidity ?? '—'}% · Wind ${weather.wind ?? '—'} km/h`;
  const forecast = document.querySelector('#forecast'); forecast.replaceChildren();
  for (const day of weather.days) {
    const item = document.createElement('div'); item.className = 'day';
    const date = document.createElement('span'); date.textContent = day.date;
    const range = document.createElement('strong'); range.textContent = Number.isFinite(day.high) && Number.isFinite(day.low) ? `${degrees(day.high)} / ${degrees(day.low)}` : '—';
    const conditions = document.createElement('small'); conditions.textContent = day.conditions;
    item.append(date,range,conditions); forecast.append(item);
  }
  for (const [id,value] of [['celsius','C'],['fahrenheit','F']]) document.querySelector('#'+id).setAttribute('aria-pressed',String(unit === value));
}
form.addEventListener('submit', async event => {
  event.preventDefault(); request?.abort();
  const controller = new AbortController(); request = controller;
  const key = form.elements.apiKey.value;
  if (!key.trim()) { form.querySelector('details').open = true; status.textContent = 'Enter your Visual Crossing API key to load a real forecast.'; form.elements.apiKey.focus(); return; }
  status.textContent = 'Looking at the skies…'; form.setAttribute('aria-busy','true');
  try {
    const data = await fetchWeather(form.elements.location.value,key,{signal:controller.signal});
    if (request !== controller) return;
    weather = normalizeWeather(data); sample = false; render(); status.textContent = 'Forecast updated.';
  } catch (error) {
    if (error.name !== 'AbortError' && request === controller) status.textContent = error instanceof TypeError ? 'The connection failed. Check your network and try again.' : error.message;
  } finally { if (request === controller) form.setAttribute('aria-busy','false'); }
});
document.querySelector('#sample').addEventListener('click', () => {
  request?.abort(); request = null; form.setAttribute('aria-busy','false');
  weather = normalizeWeather(sampleWeather); sample = true; render(); status.textContent = 'Exploring example data. Add an API key for current weather.';
});
for (const [id,value] of [['celsius','C'],['fahrenheit','F']]) document.querySelector('#'+id).addEventListener('click', () => {
  unit = value;
  if (weather) render();
  else for (const [button,choice] of [['celsius','C'],['fahrenheit','F']]) document.querySelector('#'+button).setAttribute('aria-pressed',String(unit === choice));
});
