
let config = {
	address: "0.0.0.0", 	
	port: 8080,
	basePath: "/", 	
	ipWhitelist: [], 

	useHttps: false, 		
	httpsPrivateKey: "", 	
	httpsCertificate: "", 	

	language: "en",
	locale: "en-US",
	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 12,
	units: "metric",

	modules: [
		{
			module: 'MMM-BackgroundSlideshow',
			position: 'fullscreen_below',
			config: {
			  imagePaths: ['/home/thai/images'],
			  showImageInfo: false,
			  sortImagesBy: 'created'
			}
		 },
		{
			module: "clock",
			position: "bottom_left",	// This can be any of the regions.
			config: {
			}
		},
		{
			module: 'MMM-MQTT',
			header: 'MQTT',
			config: {
				logging: true,
				useWildcards: false,
				mqttServers: [
					{
						address: 'localhost',         
						port: '1883',                
						clientId: 'mirror',         
						subscriptions: [
							{
								topic: 'smart_frame/update_media'
							}
						]
					}
				]
			}
		},
		{
			module: "MMM-OpenWeatherForecast",
			position: "top_right",
			header: "Forecast",
			config: {
			  apikey: "85f4087a1d3f1365a8b6b8d95dda22d6",
			  latitude: 41.4993,
			  longitude: -81.681290,
			  units: "imperial",
			  colored: true,
			  concise: true,
			  showFeelsLikeTemp: true,
			  showCurrentConditions: true,
			  showSummary: false,
			  showExtraCurrentConditions: false,
			  showDailyForecast: false	,
			  showHourlyForecast: true,
				showHourlyTableHeaderRow: true,
				hourlyForecastInterval: 2,
				maxHourliesToShow: 3,
			  extraCurrentConditions: {
				highLowTemp: false,
				precipitation: false,
				sunrise: false,
				sunset: false,
				wind: false,
				barometricPressure: false,
				humidity: false,
				dewPoint: false,
				uvIndex: false,
				visibility: false
			  }
			}
		  },
		  {
			module: "MMM-HomeAutomationNotifications",
			position: "top_left",	// This can be any of the regions.
			config: {
				max: 1,
				duration: 1000
			}
		}

	]
};


if (typeof module !== "undefined") {module.exports = config;}
