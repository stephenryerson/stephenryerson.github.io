var API_weather_key = '&appid=781e7ba717e34a6b8af042eda7e71fd1';

var location_search = 'Toronto';
var coordinate_search = 'location=';
var coordinates;

var JSON_time_server = 'https://maps.googleapis.com/maps/api/timezone/json?';
var JSON_weather_server = 'http://api.openweathermap.org/data/2.5/weather?q=';
var JSON_forcast_server = 'http://api.openweathermap.org/data/2.5/forecast?q=';

var icon_url = "http://cake-net.zapto.org/~alex/rsc/img/weather/";

var location_text = document.getElementById("location");
var temperature_text = document.getElementById("temperature");
var location_searchbox = document.getElementById("location_searchbox");

var weather_object;
var longitude;
var latitude; 
var day;
var hour;
var sunset_hour;
var sunrise_hour;

function validate(location) {

  var cityFormat = /^[A-Za-z]+$/; //letters only
  var cityCountryFormat = /^[A-Za-z]+[,][A-Za-z]{2}$/; //letters comma 2 letters

  if (!location.value.match(cityFormat) && !location.value.match(cityCountryFormat)) {
    alert("Invalid location format.");
    return false;
  }

  loadWeather(location);
}

function loadWeather(location)
{
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "api.openweathermap.org/data/2.5/weather?q=toronto&appid=781e7ba717e34a6b8af042eda7e71fd1", true);
  xmlhttp.onreadystatechange = function() 
  {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
    {
      //var myArr = JSON.parse(this.responseText);
      //parseJSON(request.responseText);
      alert("yes");
    }
    else
    {
console.log(xmlhttp.status);
      alert("no");
    }
  };
  xmlhttp.send();
  //var myArr = JSON.parse(xmlhttp.responseText);
}

function parseJSON(text)
{
alert("test");
	console.log("[parseJSON] json_text: "+text);
	weather_object = JSON.parse(text);
	displayWeather(weather_object);
}

function displayWeather(weather_object)
{
	var weather_text = document.getElementById("weather_today");
	var humidity_text = document.getElementById("humidity");
	var wind_text = document.getElementById("wind");
	var sunrise_text = document.getElementById("sunrise");
	var sunset_text = document.getElementById("sunset");
	var today = weather_object.weather[0];
	var temperature = weather_object.main.temp;

	longitude = weather_object.coord.lon;
	latitude = weather_object.coord.lat;
	//alert("Long-Lat: "+longitude+","+latitude);
	coordinates = latitude+","+longitude;
	var sunset_date = new Date(weather_object.sys.sunset*1000);
	var sunrise_date = new Date(weather_object.sys.sunrise*1000);
	sunrise_text.innerHTML = "Sunrise at: "+sunrise_date.getHours() + ":"+ sunrise_date.getMinutes();
	sunset_text.innerHTML = "Sunset at: "+sunset_date.getHours() + ":" + sunset_date.getMinutes();
	sunset_hour = sunset_date.getHours();
	sunrise_hour = sunrise_date.getHours();
	
	//alert(new Date(weather_object.sys.sunrise*1000).getHours());
	//alert(new Date(weather_object.sys.sunset*1000).getHours());
	//alert("Sunrise hour: "+sunrise_hour);
	getTime(today);
	temperature_text.innerHTML = kelvinToCelcius(temperature);
	humidity_text.innerHTML = "Humidity: "+weather_object.main.humidity+"%";
	wind_text.innerHTML = "Wind speed: "+weather_object.wind.speed+" m/s";
	//alert("Wind speed: "+weather_object.wind.speed);
	weather_text.innerHTML = today.description+", "+today.main;
	location_text.innerHTML = weather_object.name;
	//timestamp_field.innerHTML = weather_object
	loadForcast();
}

function getTime(today)
{
	console.log("[getTime] json_time_server: "+JSON_time_server+coordinate_search+coordinates+API_time_key);
	var request = new XMLHttpRequest();
	request.open('GET', JSON_time_server+coordinate_search+coordinates+API_time_key, true);
	request.onload = function() 
	{
		//Successfull request
		if (request.status >= 200 && request.status < 400) 
		{
			console.log("[getTime] json_text: "+request.responseText);
			displayTime(JSON.parse(request.responseText), today);
		} 
		//Unsuccessfull request
		else {}
	};

	request.onerror = function() 
	{
	// There was a connection error of some sort
	};
	request.send();
}

function displayTime(time, today)
{
	var time_field = document.getElementById('time');
	/*
	var date = new Date('1/1/1970'); //new Date('1/1/1970');
	var timestamp = date.getTime();
	*/
	var offset = new Date().getTime();
	var date = new Date(time.dstOffset+time.rawOffset+offset);
	console.log("[displayTime] time: "+date.toString());
	time_field.innerHTML = date.toString();
	day = date.getDay();
	hour = date.getHours();
	displayGreeting(date.getHours());
	console.log("[displayTime] today: "+today);
	//Since icon depends on time we must have it run after our async http request.
	displayIcon(today);
}

/* */
function displayGreeting(time)
{
	var greeting_text = document.getElementById("greeting");

	console.log("[displayGreeting] morning: "+(time > 5 && time < 12));

	if (time > 5 && time < 12)
		greeting_text.innerHTML = "Good morning!";
	else
		greeting_text.innerHTML = "Good evening!";
}

function displayIcon(weather)
{
	var weather_icon = document.getElementById("weather_icon");
	var code = weather.main;
	var extention = ".png";
	console.log("[displayIcon] hour: "+hour);
	//alert("Sunrise hour icon: "+sunrise_hour);
	//alert("Sunset hour icon: "+sunset_hour);
	//alert(hour > sunrise_hour);
	//alert(hour < sunset_hour);
	var time_code;
	if  (hour > sunrise_hour && hour < sunset_hour)
		time_code = "";
	else
		time_code = "_night";
	
	switch (code)
	{
		case "Clouds":
			//Cloud weather icon
			weather_icon.src = icon_url+"cloudy1"+time_code+extention;
			break;
		case "Rain":
			weather_icon.src = icon_url+"shower1"+time_code+extention;
			break;
		case "Snow":
			weather_icon.src = icon_url+"snow1"+time_code+extention;
			break;
		case "Clear":
			weather_icon.src = icon_url+"sunny"+time_code+extention;
			break;
	}
}

/* Returns temperature of main webpage to 2 decimal places */
function kelvinToCelcius(kelvin)
{
	return ((kelvin - 273.15).toFixed(2)).toString() + "°c";
}

function loadForcast()
{
	console.log("[loadForcast] json_forcast_server: "+JSON_weather_server+location_search+API_weather_key);
	//HTTP request to server
	var request = new XMLHttpRequest();
	request.open('GET', JSON_forcast_server+location_search+"&appid=781e7ba717e34a6b8af042eda7e71fd1", true);
	request.onload = function() 
	{
		//Successfull request
		if (request.status >= 200 && request.status < 400) 
		{
			console.log("[loadForcast] json_text: "+request.responseText);
			displayForcast(JSON.parse(request.responseText));
		} 
		//Unsuccessfull request
		else {}
	};

	request.onerror = function() 
	{
	// There was a connection error of some sort
	};
	request.send();
}

function displayForcast(forcast_object)
{
	var forcast_text = document.getElementById("forecast");
	var today_forecast_text = document.getElementById("hour_forecast");
	var days = forcast_object.list;
	var max_temp = new Array(); 
	var forcast_today = new Array();
	var forcast_hour = new Array();
	var hour_counter = 0;

	for (var i = 0; i < days.length; i++)
	{
		var daynumber = new Date(days[i].dt*1000).getDay();

		if (daynumber == day)
		{
			forcast_today[hour_counter] = kelvinToCelcius(days[i].main.temp_max);
			var padding;
			if ((new Date(days[i].dt*1000).getMinutes()+"").length < 2)
			{
				padding = "0";
				forcast_hour[hour_counter] = new Date(days[i].dt*1000).getHours() + ":" + new Date(days[i].dt*1000).getMinutes()+padding;
			}
			else
				forcast_hour[hour_counter] = new Date(days[i].dt*1000).getHours() + ":" + new Date(days[i].dt*1000).getMinutes();
			hour_counter++;
		}
		//console.log("[displayForcast] days: "+daynumber);
		//console.log("[displayForcast] truth: "+max_temp[daynumber]);
		if (!(max_temp[daynumber]) || max_temp[daynumber] < days[i].main.temp_max) 
		{
			max_temp[daynumber] = kelvinToCelcius(days[i].main.temp_max);
			//console.log("[displayForcast] max_temp: "+max_temp[daynumber]);
		}
	}
	
	//console.log("[displayForcast] max_temp.length: "+max_temp.length);
	var forcast = "<h1>Forecast</h1>";

	console.log("[displayForcast] day: "+day);
	var i = day;
	while (max_temp[i])
	//for (var i = 0; i < max_temp.length; i++)
	{
		if (i >= 6)	i = 0;
		var day_text = getDay(i);
			forcast = forcast+"<p>"+day_text+": "+max_temp[i]+"</p>"
			console.log("[displayForcast] max_temp: "+day_text+","+max_temp[i]);
		i++;
	}

	forcast_text.innerHTML = forcast;
	var hour_forecast = "<h1>Hourly forecast</h1>";
	for (var counter = 0; counter < forcast_today.length; counter++)
	{
		hour_forecast = hour_forecast + "<p>"+forcast_hour[counter]+" "+forcast_today[counter]+"</p>";
	}
	today_forecast_text.innerHTML = hour_forecast;
}

function getDay(number)
{
	var day_text = "";
	switch (number)
	{
		case 0: 
			day_text = "Sunday";
			break;
		case 1: 
			day_text = "Monday";
			break;
		case 2: 
			day_text = "Tuesday";
			break;
		case 3: 
			day_text = "Wednesday";
			break;
		case 4: 
			day_text = "Thursday";
			break;
		case 5: 
			day_text = "Friday";
			break;
		case 6: 
			day_text = "Saturday";
			break;
	}
	return day_text;
}
