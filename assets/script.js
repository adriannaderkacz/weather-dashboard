$(function () {
    const apiKey = '6cc82ba93e3c9d5b001de40f8bb9b475'; //API key for accessing weather data
    //Initialize the application by loading cities from local storage and setting up event listeners
    getFromLocalStorage(); //Load previously searched cities from local storage
    checkHistoryButton(apiKey); //Set up event listeners for the search history buttons
    searchCityWeather(apiKey); //Set up the search functionality for new city weather data
});

//Retrieve and display cities from local storage
function getFromLocalStorage() {
    const cityList = JSON.parse(localStorage.getItem('savedCitiesList')); //Retrieve city list from local storage
    if (cityList) {
        $.each(cityList, (i) => { //Iterate over the city list and add each city as a button
            addCityBtn(cityList[i]);
        })
    }
}

//Clear weather data from the UI
function clearPrevious() {
    $('#today').empty(); //Clear current weather data
    $('#forecast').empty(); //Clear weather forecast data
}

//Event listener for the search button to fetch new city weather data
function searchCityWeather(key) {
    $("#search-button").click(function (event) {
        event.preventDefault(); //Prevent default form submission behavior
        clearPrevious(); //Clear any previous weather data displayed
        const cityName = getProperName($('#search-input')); //Format the city name entered by the user
        if (cityName == "") { //Validate that the search input is not empty
            $('#today').removeClass('today-weather'); //Remove styling if no city is entered
            alert("Please enter a location"); //Alert user to enter a location
        } else {
        getWeather(cityName, key); //Fetch weather data for the entered city
        };
    })
}

//Format the city name input to proper case for consistency
function getProperName(input) {
    const properName = input.val().trim().toLowerCase().replace(/\b[a-z]/g, function (txtVal) {
        return txtVal.toUpperCase(); //Convert first letter of each word to uppercase
    });
    return properName;
}

//Fetch weather data for a given location
async function getWeather(location, key) {
    $('#search-input').val(''); //Clear the input field after a search
    try {
        //Construct URL for geolocation API request
        const geoQueryUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${key}`;
        const res = await fetch(geoQueryUrl); //Fetch geolocation data
        const data = await res.json(); //Parse JSON response

        if (data.length > 0) { //Check if location data is returned
            addCityBtn(location); //Add the searched city to the history
            addToLocalStorage(location); //Store the city in local storage
            //Construct URL for weather forecast
            const weatherQueryUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data[0].lat}&lon=${data[0].lon}&appid=${key}&units=metric`;
            getWeatherData(weatherQueryUrl, location); //Fetch weather forecast data
        } else if (data.length == 0) {
            alert("Please enter a valid location"); //Alert if entered location is invalid
        }
    } catch (err) {
        alert("There are problems with the API request, or the location entered is invalid"); // Alert on API request failure
        console.log("Issue encountered with the geographical data", err); //Log error details to the console
    }
}

//Add a new city button to the search history
function addCityBtn(location) { //Create a new button for the city and append it to the history section
    const lastCity = $('<button>').text(location).addClass('btn btn-secondary mb-2 cityButton').attr('data-location', location);
    $('#history').append(lastCity);
}

//Store the searched city in local storage
function addToLocalStorage(location) {
    const cityList = JSON.parse(localStorage.getItem('savedCitiesList')) || []; //Retrieve city list or initialize it
    cityList.push(location); //Add the new city to the list
    localStorage.setItem('savedCitiesList', JSON.stringify(cityList)); //Update local storage with new list
}

//Fetch and display weather data
async function getWeatherData(url, location) {
    try {
        const response = await fetch(url); //Fetch weather data
        const data = await response.json(); //Parse JSON response

        //Extracting and constructing the current weather icon URL
        const currentIconCode = data.list[0].weather[0].icon;
        const currentIconSource = `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`;
        const currentIcon = $('<img>').attr({ src: currentIconSource, width: "50px", height: "auto" });

        //Formatting and displaying today's date and city header
        const todayDt = dayjs().format('DD/M/YYYY');
        const cityHeader = $('<h4>').text(`${location} (${todayDt})`);

        //Extracting and displaying today's weather details
        const todayTemp = $('<p>').text(`Temperature: ${Math.round(data.list[0].main.temp)}°C`);
        const feelsLike = $('<p>').text(`Feels like: ${Math.round(data.list[0].main.feels_like)}°C`);
        const todayWind = $('<p>').text(`Wind: ${Math.round(data.list[0].wind.speed)} m/s`);
        const todayHumidity = $('<p>').text(`Humidity: ${data.list[0].main.humidity}%`);

        //Appending the current weather information to the 'today' section
        $('#today').append(cityHeader, currentIcon, todayTemp, feelsLike, todayWind, todayHumidity);
        $('#today').addClass('today-weather');

        //Processing and displaying the forecast data
        const noonArray = data.list.filter(item => {
            return item.dt_txt.includes("12:00:00");
        });
        $.each(noonArray, (i) => {
            let fullDate = noonArray[i].dt_txt; //Extract the full timestamp for each forecast item
            let dayObj = new Date(fullDate); //Convert the timestamp into a Date object
            const dayOnly = dayObj.getDate(); //Get the day from the Date object
            const todayDay = dayjs().format('DD'); //Get today's day for comparison

            //Check if the forecast day is different from today
            if (todayDay != dayOnly) {
                var arrayOfDate = fullDate.split(" "); //Split the timestamp into date and time
                //Reformat the date from YYYY-MM-DD to DD-MM-YYYY
                let futureDate = arrayOfDate[0].replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3-$2-$1");
                
                //Create a new card element for each day's forecast
                let cardDate = $('<h5>').text(futureDate);
                let iconCode = noonArray[i].weather[0].icon.replace('n', 'd'); //Ensure day icons are used for forecast
                let iconSource = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                let cardIcon = $('<img>').attr({ src: iconSource, width: "50px", height: "auto" });
                let cardTemp = $('<p>').text(`Temp: ${Math.round(noonArray[i].main.temp)}°C`);
                let cardWind = $('<p>').text(`Wind: ${Math.round(noonArray[i].wind.speed)} m/s`);
                let cardHumidity = $('<p>').text(`Humidity: ${noonArray[i].main.humidity}%`);
                
                let newCard = $('<div>').addClass('card forecast-card');
                newCard.append(cardDate, cardIcon, cardTemp, cardWind, cardHumidity);
                let cardCol = $('<div>').addClass('col');
                cardCol.append(newCard);
                $('#forecast').append(cardCol); //Append the new card to the forecast section
            }
        })
    } catch (err) {
        alert("Issues with obtaining weather data!"); //Alert the user in case of an error
        console.log("ERROR with WEATHER data!", err); //Log error details in console for debugging
    }
}

//Event listener for buttons representing previously searched cities
function checkHistoryButton(key) {
    $(document).off('click', '#history .cityButton').on('click', '#history .cityButton', function (e) {
        e.preventDefault(); //Prevent default button behavior
        clearPrevious(); //Clear existing weather data
        let locationName = $(this).data('location'); //Retrieve the location from the button's data
        recallHistoryCity(locationName, key); //Fetch weather data for the selected city
    })
}

//Fetch weather data for a city from the history
async function recallHistoryCity(location, key) { //Similar to getWeather function, with adjustments for recalled city
    try {
        const historyGeoQueryUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${key}`;
        const res = await fetch(historyGeoQueryUrl);
        const data = await res.json();
        const newWeatherQueryUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data[0].lat}&lon=${data[0].lon}&appid=${key}&units=metric`;
        getWeatherData(newWeatherQueryUrl, location);
        } catch (err) {
            alert("Please enter a valid location!");
            console.log("ERROR with GEO data:", err);
        }
}

//Assign CSS styling to HTML elements
$('#search-input').addClass('form-control rounded');
$('#search-button').addClass('btn btn-primary mt-2').css('width','100%'); //Style the search button