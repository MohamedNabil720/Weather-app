//  ~ =================> HTML ELEMENTS

let cardsContainer = document.querySelector(".forecast-cards");
let searchBox = document.getElementById("searchBox");
let ClearAll = document.getElementById("Clear");
let locationElement = document.querySelector("p.location");
let allBars = document.querySelectorAll(".clock")
const cityContainer = document.querySelector(".city-items")




//  ~ =================> APP Variables

const apiKey = 'ffa2e1a723be46cf92c60638242303'

const baseUrl = 'https://api.weatherapi.com/v1/forecast.json'

const currentLocation = 'cairo'

let recentCity = JSON.parse(localStorage.getItem("city")) || []

//  ~ =================> Functions

async function getWeather(location) {
    const res = await fetch(`${baseUrl}?key=${apiKey}&days=7&q=${location}`)
    if (res.status !== 200) {
        searchBox.value = ''

        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Please Enter valid City or Location",
        });
        return
    }
    const data = await res.json()
    displayWeather(data)
    searchBox.value = '';
    console.log(data);
}




function displayWeather(data) {

    locationElement.innerHTML = `<span class="city-name"> ${data.location.name} </span> ${data.location.country} `
    const days = data.forecast.forecastday
    const now = new Date();
    let cardsHTML = ""
    for (let [index, day] of days.entries()) {
        const date = new Date(day.date);
        cardsHTML += `
        <div class= ' card ${index == 0 ? "active" : ""}' data-index=${index}>
        <div class="card-header ">
        <div class="day"> ${date.toLocaleDateString('en-us', { weekday: "long" })} </div>
        <div class="time">${now.getHours()}:${now.getMinutes()} ${now.getHours() > 11 ? "pm" : "am"}</div>
        </div>
        <div class="card-body">
        <img src="./imgs/conditions/${day.day.condition.text}.svg"/>
        <div class="degree">${day.hour[now.getHours()].temp_c}°C</div>
        </div>
        <div class="card-data">
        <ul class="left-column">
        <li>Real Feel: <span class="real-feel">${day.hour[now.getHours()].feelslike_c}°C</span></li>
        <li>Wind: <span class="wind">${day.hour[now.getHours()].wind_kph} K/h</span></li>
        <li>Pressure: <span class="pressure">${day.hour[now.getHours()].pressure_mb}Mb</span></li>
        <li>Humidity: <span class="humidity">${day.hour[now.getHours()].humidity}%</span></li>
        </ul>
        <ul class="right-column">
        <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
        <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
        </ul>
        </div>
    </div>
    `
    }
    cardsContainer.innerHTML = cardsHTML;
    const allCards = document.querySelectorAll(".card");
    for (let card of allCards) {
        card.addEventListener("click", function (event) {
            const activeCard = document.querySelector(".card.active")
            activeCard.classList.remove("active")
            event.currentTarget.classList.add("active")
            displayRain(days[event.currentTarget.dataset.index])
        })
    }
    let exist = recentCity.find(function (currentCity) {

        return currentCity.city == data.location.name

    })
    if (exist) return;
    recentCity.push({ city: data.location.name, country: data.location.country })
    localStorage.setItem("city", JSON.stringify(recentCity))
    displayImg(data.location.name, data.location.country)
}

function displayRain(weather) {

    for (let element of allBars) {

        const clock = element.dataset.clock;
        const height = weather.hour[clock].chance_of_rain
        element.querySelector(".percent").style.height = `${height}%`
    }
}

async function getCityImg(city) {

    const res = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${city}
    &client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`)
    const data = await res.json();
    return data.results
}

async function displayImg(city, country) {
    let imgArr = await getCityImg(city, country)
    if (imgArr !== 0) {
        const random = Math.trunc(Math.random() * imgArr.length);
        imgSrc = imgArr[random].urls.regular
        let itemContent = `
    <div class="item">
    <div class="city-image">
    <img src="${imgSrc}" alt="Image for ${city} city" />
    </div>
    <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
    </div>
`;
        cityContainer.innerHTML += itemContent;
    }
}

function unfocus() {
    searchBox.disabled = true;
    searchBox.disabled = false;
}

function success(position) {
    const currentLocation = `${position.coords.latitude},${position.coords.longitude}`
    getWeather(currentLocation)
}

async function clearData() {

    localStorage.clear()
    cityContainer.innerHTML = ''
    location.reload()

}



//  ~ =================> Events

window.addEventListener("load", function () {

    navigator.geolocation.getCurrentPosition(success)
    for (let i = 0; i < recentCity.length; i++) {
        displayImg(recentCity[i].city, recentCity[i].country)
    }
})

searchBox.addEventListener("blur", function () {
    getWeather(this.value)
})

document.addEventListener("keyup", function (e) {

    if (e.key == "Enter") {
        getWeather(searchBox.value);
        unfocus();
    }
})

ClearAll.addEventListener("click", clearData)

