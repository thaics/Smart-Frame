
let config = {
	address: "0.0.0.0", 	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/", 	// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
					// you must set the sub path here. basePath must end with a /
	ipWhitelist: [], 	// Set [] to allow all IP addresses
															// or add a specific IPv4 of 192.168.1.5 :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
															// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false, 		// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "", 	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "", 	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",
	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 24,
	units: "metric",
	// serverOnly:  true/false/"local" ,
	// local for armv6l processors, default
	//   starts serveronly and then starts chrome browser
	// false, default for all NON-armv6l devices
	// true, force serveronly mode, because you want to.. no UI on this device

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
		    // you can hide this module afterwards from the remote control itself
		    config: {
		        customCommand: {},  // Optional, See "Using Custom Commands" below
		        showModuleApiMenu: true, // Optional, Enable the Module Controls menu
		        secureEndpoints: true, // Optional, See API/README.md
		        // uncomment any of the lines below if you're gonna use it
		        // customMenu: "custom_menu.json", // Optional, See "Custom Menu Items" below
		        // apiKey: "", // Optional, See API/README.md for details
		        // classes: {} // Optional, See "Custom Classes" below
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
						address: 'localhost',          // Server address or IP address
						port: '1883',                  // Port number if other than default
						clientId: 'mirror',         // Custom MQTT client ID (optional)
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

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
