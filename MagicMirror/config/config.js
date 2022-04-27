
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
	timeFormat: 24,
	units: "metric",

	modules: [
		{
			module: 'MMM-BackgroundSlideshow',
			position: 'fullscreen_below',
			config: {
			  imagePaths: ['/home/thai/images'],
			  showImageInfo: true,
			  sortImagesBy: 'created',
			}
		 },
		 {
		    module: 'MMM-Remote-Control',
			position: 'bottom_left',
		    config: {
		        customCommand: {},  
		        showModuleApiMenu: true, 
		        secureEndpoints: true, 
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
}
	]
};


if (typeof module !== "undefined") {module.exports = config;}
