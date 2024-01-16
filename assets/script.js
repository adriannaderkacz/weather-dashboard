$(function () {
    const apiKey = '6cc82ba93e3c9d5b001de40f8bb9b475'; //API key for accessing weather data
    //Initialize the application by loading cities from local storage and setting up event listeners
    getFromLocalStorage(); //Load previously searched cities from local storage
    checkHistoryButton(apiKey); //Set up event listeners for the search history buttons
    searchCityWeather(apiKey); //Set up the search functionality for new city weather data
});