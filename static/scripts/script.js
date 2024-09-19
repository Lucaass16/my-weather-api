import dotenv from "dotenv";
dotenv.config()

var map = L.map('map').setView([51.505, -0.09], 9)
var marker = L.marker([51.5, -0.09]).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const weatherForm = document.querySelector(".weather-form");
const cityInput = document.querySelector(".city-input");
const card = document.querySelector(".card");
const tempCityDisplay = document.getElementById("cityTempDisplay");
const apiKey = process.env.API_KEY;
const minMax = document.querySelector(".min-max")

console.log(apiKey)

document.addEventListener("DOMContentLoaded", async function() {
    try {
        const weatherData = await getWeatherData("London");
        displayWeatherData(weatherData);
    } catch (error) {
        console.error(error);
        displayError("Erro ao obter dados climáticos para Londres.");
    }
});

weatherForm.addEventListener("submit", async event => {

    event.preventDefault();

    const city = cityInput.value;

    if(city)
    {
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherData(weatherData);
        } catch (error) {
            console.error(error);
            displayError(error);
        }
    }
    else
    {
        displayError("Digite uma cidade!")
    }

})

async function getWeatherData(city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    const response = await fetch(apiUrl);

    
    console.log(response)
    if(!response.ok)
    {
        throw new Error("Could not fetch weather data");
    }

    return await response.json();
}

function updateMap(lat, lon) {
    map.setView([lat, lon], 13);
    marker.setLatLng([lat, lon]);
}

async function getWeatherDataByCoordinates(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Could not fetch weather data");
    }
    
    return await response.json();
}

map.on('click', async function(e) {
    const { lat, lng } = e.latlng;
    
    try {
        const weatherData = await getWeatherDataByCoordinates(lat, lng);
        displayWeatherData(weatherData);
    } catch (error) {
        console.error(error);
        displayError("Erro ao obter dados climáticos para a localização selecionada.");
    }
});

function displayWeatherData(data){
    console.log(data);

    const { name: city, main: { feels_like, temp, humidity, temp_max, temp_min }, weather: [{ description, icon }], visibility, sys: { sunrise, sunset }, coord: { lat, lon } } = data;

    tempCityDisplay.textContent = ""; 
    const weatherDetails = document.getElementById("weatherDetails");
    minMax.textContent = "";
    weatherDetails.textContent = ""; 
    card.style.display = "flex";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const feelsLikeDisplay = document.createElement("p");
    const tempMaxDisplay = document.createElement("p");
    const tempMinDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const visibilityDisplay = document.createElement("p");
    const sunriseDisplay = document.createElement("p");
    const sunsetDisplay = document.createElement("p");

    const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`

    const weatherIcon = document.createElement("img");
    weatherIcon.src = iconURL

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${(temp - 273.15).toFixed(2)}°C`;
    tempMinDisplay.textContent = `Min: ${(temp_min - 273.15).toFixed(2)}°C`;
    tempMaxDisplay.textContent = `Max: ${(temp_max - 273.15).toFixed(2)}°C`;
    feelsLikeDisplay.textContent = `Sensação ${(feels_like - 273.15).toFixed(2)}°C`
    humidityDisplay.textContent = `Humildade: ${humidity}%`;
    descDisplay.textContent = `Clima: ${description}`;
    visibilityDisplay.textContent = `Visibilidade: ${(visibility / 1000).toFixed(1)} km`;

    const sunriseTime = new Date(sunrise * 1000).toLocaleTimeString("pt-BR");
    const sunsetTime = new Date(sunset * 1000).toLocaleTimeString("pt-BR");

    sunriseDisplay.textContent = `Nascer do sol: ${sunriseTime}`;
    sunsetDisplay.textContent = `Pôr do sol: ${sunsetTime}`;

    tempDisplay.classList.add("temp-display");
    feelsLikeDisplay.classList.add("row-item")
    humidityDisplay.classList.add("row-item");
    descDisplay.classList.add("row-item");
    visibilityDisplay.classList.add("row-item");
    sunriseDisplay.classList.add("row-item");
    sunsetDisplay.classList.add("row-item");

    tempCityDisplay.appendChild(weatherIcon);
    tempCityDisplay.appendChild(cityDisplay);
    tempCityDisplay.appendChild(tempDisplay);
    minMax.appendChild(tempMinDisplay)
    minMax.appendChild(tempMaxDisplay);
    weatherDetails.appendChild(humidityDisplay);
    weatherDetails.appendChild(descDisplay);
    weatherDetails.appendChild(visibilityDisplay);
    weatherDetails.appendChild(feelsLikeDisplay)
    weatherDetails.appendChild(sunriseDisplay);
    weatherDetails.appendChild(sunsetDisplay);

    updateMap(lat, lon);
}

function displayError(message){

    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("error-display");

    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorDisplay)
}