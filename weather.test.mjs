import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchWeather,normalizeWeather,temperature,weatherTheme,sampleWeather} from './weather-api.mjs';
test('weather is normalized and Celsius converts locally to Fahrenheit', () => {
  const result = normalizeWeather(sampleWeather);
  assert.equal(result.temperature,22); assert.equal(result.location,'Tashkent, Uzbekistan'); assert.equal(result.days.length,3);
  assert.equal(temperature(0,'F'),32); assert.equal(temperature(100,'F'),212); assert.equal(temperature(-40,'F'),-40); assert.equal(temperature(22,'C'),22);
  assert.equal(weatherTheme('clear-night'),'night'); assert.equal(weatherTheme('clear-day'),'clear'); assert.equal(weatherTheme('rain'),'rain');
  assert.throws(() => normalizeWeather({}), /incomplete/);
});
test('weather request encodes locations and separates fetching from data processing', async () => {
  let captured;
  const result = await fetchWeather(' New York, US ','example-key',{fetcher:async url => {captured=new URL(url);return {ok:true,json:async()=>sampleWeather};}});
  assert.equal(result,sampleWeather); assert.equal(decodeURIComponent(captured.pathname.split('/').at(-1)),'New York, US');
  assert.equal(captured.searchParams.get('unitGroup'),'metric'); assert.equal(captured.searchParams.get('key'),'example-key');
});
test('weather reports bad credentials, quota limits and HTTP errors without exposing keys', async () => {
  for (const [status,message] of [[401,/key was not accepted/],[429,/limit/],[400,/HTTP 400/]]) {
    await assert.rejects(fetchWeather('London','example-key',{fetcher:async()=>({ok:false,status})}),message);
  }
  await assert.rejects(fetchWeather('London',''),/Enter a location/);
});
