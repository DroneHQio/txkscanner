import { Router } from 'express';
import { db } from '../db/database';
import { weather_snapshots } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import https from 'https';

const router = Router();

function httpsGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'HazMatSceneRunner/1.0 (emergency-response-app)',
        'Accept': 'application/geo+json,application/json',
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Failed to parse response')); }
      });
    }).on('error', reject);
  });
}

async function fetchNWSWeather(lat: number, lon: number) {
  const pointsData = await httpsGet(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`);
  if (!pointsData?.properties) throw new Error('NWS points API returned no properties');

  const { forecast: forecastUrl, observationStations: stationsUrl } = pointsData.properties;

  let forecastSummary = '', windSpeed = '', windDirection = '';
  let temperature: number | null = null;

  if (forecastUrl) {
    const forecastData = await httpsGet(forecastUrl);
    const periods = forecastData?.properties?.periods;
    if (periods?.length > 0) {
      const current = periods[0];
      forecastSummary = current.shortForecast || '';
      windSpeed = current.windSpeed || '';
      windDirection = current.windDirection || '';
      temperature = current.temperature || null;
    }
  }

  let humidity: number | null = null;
  let windGust = '';

  if (stationsUrl) {
    try {
      const stationsData = await httpsGet(stationsUrl);
      const stationId = stationsData?.features?.[0]?.properties?.stationIdentifier;
      if (stationId) {
        const obsData = await httpsGet(`https://api.weather.gov/stations/${stationId}/observations/latest`);
        const obs = obsData?.properties;
        if (obs) {
          humidity = obs.relativeHumidity?.value ?? null;
          if (obs.windGust?.value) windGust = `${Math.round(obs.windGust.value * 2.237)} mph`;
          if (obs.temperature?.value != null) temperature = Math.round(obs.temperature.value * 9 / 5 + 32);
          if (obs.windSpeed?.value) windSpeed = `${Math.round(obs.windSpeed.value * 2.237)} mph`;
          if (obs.windDirection?.value != null) {
            const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
            windDirection = dirs[Math.round(obs.windDirection.value / 22.5) % 16];
          }
        }
      }
    } catch {}
  }

  return { temperature, humidity, wind_direction: windDirection, wind_speed: windSpeed, wind_gust: windGust, forecast_summary: forecastSummary, alerts: null, raw_data: JSON.stringify({ forecast: forecastSummary }) };
}

router.get('/:id/weather', async (req, res) => {
  try {
    const snapshots = await db.select().from(weather_snapshots)
      .where(eq(weather_snapshots.incident_id, parseInt(req.params.id)))
      .orderBy(desc(weather_snapshots.checked_at)).all();
    res.json(snapshots);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get weather' }); }
});

router.post('/:id/weather', async (req, res) => {
  try {
    const { lat, lon } = req.body;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

    let weatherData;
    try {
      weatherData = await fetchNWSWeather(parseFloat(lat), parseFloat(lon));
    } catch (e: any) {
      weatherData = { temperature: null, humidity: null, wind_direction: 'N/A', wind_speed: 'N/A', wind_gust: '', forecast_summary: `Weather data unavailable: ${e.message}`, alerts: null, raw_data: JSON.stringify({ error: e.message }) };
    }

    const now = new Date().toISOString();
    const result = await db.insert(weather_snapshots).values({ incident_id: parseInt(req.params.id), ...weatherData, checked_at: now }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch weather' }); }
});

export default router;
