const mqttHelper = require("./mqtt_helper");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  servers: [],
  logging: false,
  log: function (...args) {
    if (this.logging) {
      console.log(args);
    }
  },

  start: function () {
    console.log(this.name + ": Starting node helper");
    this.loaded = false;
  },

  startTimeout: null,

  socketNotificationReceived: function (notification, payload) {
    const messageCallback = (key, topic, value) => {
      this.log(
        `Received message from ${key}: topic: ${topic}, message: ${value}`
      );

      this.sendSocketNotification("MQTT_PAYLOAD", {
        serverKey: key,
        topic: topic,
        value: value,
        time: Date.now()
      });
      
      data = JSON.parse(value);
      media_url = data.media_url;
      attached_message = data.message;
      file_name = media_url.split("/").pop();
      dir = 'home/thai/images'
      
      var fs = require("fs"), request = require('request');
      
      var download = function(uri, filename, callback){
          request.head(uri, function(err, res, body){
              console.log('content-type:', res.headers['content-type']);
              console.log('content-length:', res.headers['content-length']);
              request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
          });
      };

      // Delete all files in local media directory
      fs.readdirSync(dir).forEach(f => fs.rmSync(`${dir}/${f}`));

      // Downloads new file from URL into local media directory
      download(media_url, dir + '/' + file_name, function(){
          console.log('Image Updated!');
      });
      
      // Alert MMM system to local change
      this.sendSocketNotification("BACKGROUNDSLIDESHOW_UPDATE_IMAGE_LIST");
    };

    if (notification === "MQTT_CONFIG") {
      this.servers = mqttHelper.addServers(
        this.servers,
        payload.mqttServers,
        this.name
      );
      this.logging = payload.logging;

      // Start clients
      // Allow 2 seconds for multiple instances to configure servers
      clearTimeout(this.startTimeout);
      this.startTimeout = setTimeout(() => {
        mqttHelper.startClients(this.servers, messageCallback, this.name);
      }, 2000);

      this.loaded = true;
    }
  }
});
