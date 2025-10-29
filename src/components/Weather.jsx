import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";

// ✅ Make sure these icons exist in src/assets folder
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import humidity_icon from "../assets/humidity.png";

const App = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");

  const allIcons = {
    clear: clear_icon,
    cloudy: cloud_icon,
    drizzle: drizzle_icon,
    rain: rain_icon,
    snow: snow_icon,
  };

  // Weather code → condition text & icon
  const getWeatherDescription = (code) => {
    const mapping = {
      0: { text: "Clear sky", icon: allIcons.clear },
      1: { text: "Mainly clear", icon: allIcons.clear },
      2: { text: "Partly cloudy", icon: allIcons.cloudy },
      3: { text: "Overcast", icon: allIcons.cloudy },
      45: { text: "Fog", icon: allIcons.drizzle },
      48: { text: "Depositing rime fog", icon: allIcons.drizzle },
      51: { text: "Light drizzle", icon: allIcons.drizzle },
      53: { text: "Moderate drizzle", icon: allIcons.drizzle },
      55: { text: "Dense drizzle", icon: allIcons.drizzle },
      61: { text: "Slight rain", icon: allIcons.rain },
      63: { text: "Moderate rain", icon: allIcons.rain },
      65: { text: "Heavy rain", icon: allIcons.rain },
      71: { text: "Slight snow fall", icon: allIcons.snow },
      73: { text: "Moderate snow fall", icon: allIcons.snow },
      75: { text: "Heavy snow fall", icon: allIcons.snow },
      80: { text: "Rain showers", icon: allIcons.rain },
      81: { text: "Moderate rain showers", icon: allIcons.rain },
      82: { text: "Violent rain showers", icon: allIcons.rain },
    };
    return mapping[code] || { text: "Unknown", icon: allIcons.clear };
  };

  const search = async (city) => {
    if (!city || city.trim() === "") {
      alert("Enter city name");
      return;
    }

    try {
      setError("");
      // 1️⃣ Get coordinates from city name
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found!");
        setWeatherData(null);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2️⃣ Get current weather + humidity
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const weatherJson = await weatherRes.json();

      if (!weatherJson.current_weather) {
        setError("Could not retrieve weather data!");
        setWeatherData(null);
        return;
      }

      const { temperature, windspeed, weathercode, time } = weatherJson.current_weather;
      const { text, icon } = getWeatherDescription(weathercode);

      // 3️⃣ Find humidity at the current hour
      const currentTimeIndex = weatherJson.hourly.time.indexOf(time);
      const humidity =
        currentTimeIndex !== -1
          ? weatherJson.hourly.relative_humidity_2m[currentTimeIndex]
          : "N/A";

      // 4️⃣ Store state
      setWeatherData({
        location: `${name}, ${country}`,
        temperature: Math.round(temperature),
        windSpeed: Math.round(windspeed),
        humidity,
        condition: text,
        icon,
      });
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Something went wrong. Please try again.");
      setWeatherData(null);
    }
  };

  useEffect(() => {
    search("Bangalore"); // default
  }, []);

  return (
    <div className="weather">
      <div className="search-bar">
        <input ref={inputRef} type="text" placeholder="Enter city..." />
        <img
          src={search_icon}
          alt="Search"
          onClick={() => search(inputRef.current.value)}
        />
      </div>

      {error && (
        <p className="error-message" style={{ color: "red", marginTop: "20px" }}>
          {error}
        </p>
      )}

      {weatherData && (
        <>
          <img src={weatherData.icon} alt="Weather Icon" className="weather-icon" />
          <p className="temperature">{weatherData.temperature}°C</p>
          <p className="location">{weatherData.location}</p>
          <p className="condition">{weatherData.condition}</p>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind Speed" />
              <div>
                <p>{weatherData.windSpeed} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
