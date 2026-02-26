// DOM element references
const cityElement = document.querySelector(".CityName");
const temperatureElement = document.querySelector(".Temp");
const descriptionElement = document.querySelector(".Description");
const DateTime = document.querySelector(".DateTime");
const image = document.querySelector("img");
const detail = document.querySelectorAll("h4");
const apiKey = "2d5dda0cd3fac9a5b71de157b9c31ede";

// Main weather fetch function
async function getWeather() {
    // Get input value and validate
    const location = document.querySelector("#citySearch").value.trim();
    if (!location) {
        alert("Please enter a city or country");
        return;
    }

    try {
        // Geocoding API to get coordinates
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        // Check if location found
        if (!geoData || geoData.length === 0) {
            throw new Error("Location not found");
        }

        // Extract location data
        const { lat, lon, name, country } = geoData[0];
        console.log(`Found ${name}, ${country} at ${lat},${lon}`);

        // Current weather API call (this works with free plan)
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // Display the weather data (without UV index)
        displayWeather(weatherData, name, country);

    } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    }
}

// Display weather data function
function displayWeather(data, locationName, country) {
    // Time calculations with timezone offset
    const Now = new Date();
    const timezoneOffset = data.timezone || 0; // Fallback to 0 if not available
    const
