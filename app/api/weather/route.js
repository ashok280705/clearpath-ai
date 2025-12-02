export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat') || '28.7041';
    const lon = searchParams.get('lon') || '77.1025';
    
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`
    );
    const weatherData = await weatherRes.json();
    
    const aqiRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&timezone=auto`
    );
    const aqiData = await aqiRes.json();
    
    const pm25 = aqiData.current?.pm2_5 || 0;
    const pm10 = aqiData.current?.pm10 || 0;
    const usAqi = aqiData.current?.us_aqi || 0;
    const euAqi = aqiData.current?.european_aqi || 0;
    
    let aqi = Math.ceil(usAqi / 50) || 1;
    if (aqi > 5) aqi = 5;
    
    const aqiLevel = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1];
    const weatherCode = weatherData.current?.weather_code || 0;
    const weatherDesc = getWeatherDescription(weatherCode);
    
    const recommendations = getRecommendations(aqi, weatherData.current?.temperature_2m, usAqi);
    
    return Response.json({
      aqi: {
        level: aqi,
        label: aqiLevel,
        usAqi: usAqi.toFixed(0),
        euAqi: euAqi.toFixed(0),
        pm25: pm25.toFixed(1),
        pm10: pm10.toFixed(1),
        co: aqiData.current?.carbon_monoxide?.toFixed(0),
        no2: aqiData.current?.nitrogen_dioxide?.toFixed(1),
        so2: aqiData.current?.sulphur_dioxide?.toFixed(1),
        o3: aqiData.current?.ozone?.toFixed(1),
      },
      weather: {
        temp: weatherData.current?.temperature_2m?.toFixed(1),
        feelsLike: weatherData.current?.apparent_temperature?.toFixed(1),
        humidity: weatherData.current?.relative_humidity_2m,
        pressure: weatherData.current?.surface_pressure?.toFixed(0),
        windSpeed: weatherData.current?.wind_speed_10m?.toFixed(1),
        windDirection: weatherData.current?.wind_direction_10m?.toFixed(0),
        uvIndex: weatherData.current?.uv_index?.toFixed(1),
        precipitation: weatherData.current?.precipitation?.toFixed(1),
        description: weatherDesc,
        maxTemp: weatherData.daily?.temperature_2m_max?.[0]?.toFixed(1),
        minTemp: weatherData.daily?.temperature_2m_min?.[0]?.toFixed(1),
        sunrise: weatherData.daily?.sunrise?.[0],
        sunset: weatherData.daily?.sunset?.[0],
      },
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function getWeatherDescription(code) {
  const codes = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 53: 'Moderate drizzle',
    55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 95: 'Thunderstorm'
  };
  return codes[code] || 'Unknown';
}

function getRecommendations(aqi, temp, usAqi) {
  const dos = [];
  const donts = [];
  const precautions = [];
  
  if (usAqi > 200) {
    dos.push('Stay indoors with air purifiers running');
    dos.push('Keep all windows and doors closed');
    dos.push('Use N95/N99 masks if you must go outside');
    donts.push('Avoid all outdoor physical activities');
    donts.push('Don\'t open windows even for ventilation');
    donts.push('Avoid using vehicles, carpool if necessary');
    precautions.push('Keep emergency medications accessible');
    precautions.push('Monitor health symptoms closely');
    precautions.push('Vulnerable groups should avoid going out');
  } else if (usAqi > 150) {
    dos.push('Limit outdoor exposure to essential activities only');
    dos.push('Use air purifiers indoors');
    dos.push('Wear N95 masks outdoors');
    donts.push('Avoid outdoor exercise and sports');
    donts.push('Don\'t spend extended time outside');
    precautions.push('Children and elderly should stay indoors');
    precautions.push('Keep windows closed during peak hours');
  } else if (usAqi > 100) {
    dos.push('Reduce prolonged outdoor exertion');
    dos.push('Monitor air quality before outdoor activities');
    donts.push('Avoid heavy outdoor exercise');
    donts.push('Don\'t exercise near traffic areas');
    precautions.push('Sensitive groups should limit outdoor time');
    precautions.push('Consider wearing masks in crowded areas');
  } else if (usAqi > 50) {
    dos.push('Enjoy outdoor activities with awareness');
    dos.push('Monitor air quality for sensitive groups');
    donts.push('Don\'t burn waste or leaves');
    precautions.push('Sensitive individuals should watch for symptoms');
  } else {
    dos.push('Enjoy outdoor activities freely');
    dos.push('Keep windows open for fresh air');
    dos.push('Exercise outdoors');
    donts.push('Don\'t litter or pollute');
    donts.push('Don\'t burn waste materials');
    precautions.push('Stay hydrated during activities');
  }
  
  if (temp > 35) {
    dos.push('Drink plenty of water');
    donts.push('Avoid direct sunlight during noon');
    precautions.push('Wear light-colored clothes');
  }
  
  return { dos, donts, precautions };
}
