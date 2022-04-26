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
      var data = JSON.parse(value);
      this.log(
        `Received message from ${key}: topic: ${topic}, message: ${value}`
      );
      this.sendSocketNotification("MQTT_PAYLOAD", {
        serverKey: key,
        topic: topic,
        value: value,
        time: Date.now()
      });
      
      new_media_id = data.image_id;
      new_media_name = data.image_name;
      
      var fs = require("fs"), request = require('request');
      
      var download = function(uri, filename, callback){
          request.head(uri, function(err, res, body){
              console.log('content-type:', res.headers['content-type']);
              console.log('content-length:', res.headers['content-length']);
          
              request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
          });
      };

      try {
          fs.unlinkSync('/home/thai/images/new_img.jpg');
      } catch (err){
          console.error(err);
      }

      download(new_media_id, '/home/thai/images/' + data.image_name, function(){
          console.log('done');
      });
      
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
