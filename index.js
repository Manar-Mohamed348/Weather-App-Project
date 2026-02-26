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

        // Current weather API call
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // UV index API call (may fail without proper subscription)
        let uvIndex = "N/A";
        try {
            const uvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            const uvResponse = await fetch(uvIndexUrl);
            const uvData = await uvResponse.json();
            uvIndex = uvData.value.toFixed(1); // Format to 1 decimal
        } catch (uvError) {
            console.log("UV data not available", uvError);
        }

        // Combine all weather data
        const completeData = {
            ...weatherData,
            uvIndex: uvIndex
        };

        // Display the weather data
        displayWeather(completeData, name, country);

    } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    }
}

// Display weather data function
function displayWeather(data, locationName, country) {
    // Time calculations with timezone offset
    const Now = new Date();
    const timezoneOffset = data.timezone;
    const localTime = new Date(Now.getTime() + timezoneOffset * 1000);

    // Basic info display
    cityElement.textContent = `${locationName}, ${country}`;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent =
        data.weather[0].description.charAt(0).toUpperCase() +
        data.weather[0].description.slice(1);
    DateTime.textContent = `${localTime.toLocaleDateString({ weekday: "long" })}`;

    // Weather icon selection
    const weatherDescription = data.weather[0].description.toLowerCase();
    switch (weatherDescription) {
        case "clear sky": image.src = "img/clear.png"; break;
        case "few clouds": image.src = "img/mist.png"; break;
        case "scattered clouds":
        case "broken clouds":
        case "overcast clouds": image.src = "img/clouds.png"; break;
        case "rain":
        case "shower rain": image.src = "img/rainny.png"; break;
        case "light intensity drizzle":
        case "light intensity shower rain":
        case "light rain": image.src = "img/drizzle.png"; break;
        case "thunderstorm": image.src = "img/storm.png"; break;
        case "snow": image.src = "img/snow.png"; break;
        case "mist":
        case "fog":
        case "haze": image.src = "img/Haze.png"; break;
    }

    // Sunrise/sunset calculations
    const sunriseUTC = new Date(data.sys.sunrise * 1000);
    const sunsetUTC = new Date(data.sys.sunset * 1000);
    const sunriseTime = new Date(sunriseUTC.getTime() + timezoneOffset * 1000);
    const sunsetTime = new Date(sunsetUTC.getTime() + timezoneOffset * 1000);

    // Update all weather details
    detail[0].textContent = sunriseTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
    detail[1].textContent = sunsetTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
    detail[2].textContent = data.uvIndex; // UV index
    detail[3].textContent = Math.round(data.wind.speed * 3.6) + " Km/h"; // Wind
    detail[4].textContent = data.main.humidity + " %"; // Humidity
    detail[5].textContent = data.main.feels_like + " °C"; // Feels like
}

// Event listeners
document.querySelector("input[type='button']").addEventListener("click", getWeather);
document.querySelector("#citySearch").addEventListener("keypress", (e) => {
    if (e.key === "Enter") getWeather();

});
