const hostAddress = window_global['mqtt']['hostname'];
const hostPort = window_global['mqtt']['websockets_port'];
const clientId = Math.random() + "_web_client";
const deviceId = window_global['device_id'];

function LampiPage($){

    console.log(clientId);

    obj = {
        connect : function() {
          obj.client.connect({onSuccess: obj.onConnect,
            onFailure: obj.onFailure});
        },

        onFailure : function(response) {
          console.log(response);
        },

        onConnect : function(response) {
          obj.client.subscribe("devices/" + deviceId + "/lamp/changed", {qos:1});
          obj.client.subscribe("devices/" + deviceId + "/smart_frame/updated", {qos:1});
          obj.client.subscribe("$SYS/broker/connection/" + deviceId + "_broker/state", {qos:1});
        },

        onConnectionLost : function(responseObject) {
          setTimeout(function(){
            // wait before reconnecting
          }, 2000);
          if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
            obj.connect();
          }
        },

        onMessageArrived : function(message) {
            if (message.destinationName.endsWith('state')) {
                obj.onMessageConnectionState(message);
            } else if (message.destinationName.endsWith('changed')) {
                obj.onMessageLampChanged(message);
            } else if (message.destinationName.endsWith('updated')) {
              obj.onMessageMediaChanged(message);
            }
        },

        onMessageConnectionState: function(message) {
            if (message.payloadString == "1" ) {
                console.log("Device Connected");
                $.unblockUI();
            } else {
                console.log("Device Disconnected");
                $.blockUI( {message: '<h1>This LAMPI device does not ' +
                            'seem to be connected to the Internet.</h1>' +
                            '<p>Please make sure it is powered on ' +
                            'and connected to the network.</p>' });
            }
        },

        onMessageLampChanged: function(message) {
            new_lampState = JSON.parse(message.payloadString);
            console.log(new_lampState)
            if (obj.updated && new_lampState.client == clientId) {
                return;
            }
            obj.lampState.color.h = new_lampState.color.h;
            obj.lampState.color.s = new_lampState.color.s;
            obj.lampState.brightness = new_lampState.brightness;
            obj.lampState.on = new_lampState.on;
            obj.updateUI();
            obj.updated = true;
        },

        onMessageMediaChanged: function(message) {
          setTimeout(function(){
            // wait before reconnecting
          }, 3000);
          new_url = message.payloadString;
          $("#cur_media").attr("src", new_url);
        },

        onPowerToggle : function(inputEvent) {
          obj.lampState.on = !obj.lampState.on;
          obj.updatePowerButton();
          obj.scheduleConfigChange();
        },

        onSliderInput : function(inputEvent) {
          value = Number(inputEvent.target.value);

          if(inputEvent.target.id == "hue-slider") {
            obj.lampState.color.h = value;
          } else if(inputEvent.target.id == "saturation-slider") {
            obj.lampState.color.s = value;
          } else if(inputEvent.target.id == "brightness-slider") {
            obj.lampState.brightness = value;
          }

          obj.scheduleConfigChange();
          obj.updateUIColors();
        },

        scheduleConfigChange : function() {
          function onTimeout() {
            obj.updateTimer = null;
            obj.sendConfigChange();
          }

          if(obj.updateTimer == null) {
            obj.updateTimer = setTimeout(onTimeout, 100);
          }
        },

        sendConfigChange : function() {
          configJson = JSON.stringify(obj.lampState);

          message = new Paho.MQTT.Message(configJson);
          message.destinationName = "devices/" + deviceId + "/lamp/set_config";
          message.qos = 1;
          obj.client.send(message);
        },

        updateUI : function() {
          if(obj.isManipulatingSlider) {
            return;
          }

          setSliderValues(obj.lampState.color.h,
            obj.lampState.color.s,
            obj.lampState.brightness);
          obj.updatePowerButton();
          obj.updateUIColors();
        },

        updateUIColors : function() {
          updateSliderStyles(obj.lampState.color.h,
            obj.lampState.color.s,
            obj.lampState.brightness);
          obj.updateColorBox(obj.lampState.color.h, obj.lampState.color.s);
        },

        updatePowerButton : function() {
          opacity = obj.lampState.on ? 1.0 : 0.3;
          $( "#power" ).fadeTo(0, opacity);
          $( "#power" ).css("color", "#ff0000");
        },

        updateColorBox : function(hue, saturation) {
          color = tinycolor({ h:hue * 360, s:saturation, v:1.0 });
          hexColor = color.toHexString();
          $( "#colorbox" ).css("background-color", hexColor);
        },

        lampState : {
            color : {
                h: "50",
                s: "50"
            },
            brightness : "50",
            on: true,
            client: clientId
        },
        client : new Paho.MQTT.Client(hostAddress, Number(hostPort),
            clientId),
        updateTimer : null,
        isManipulatingSlider :false,
        updated: false,
        
        init : function() {

            if( deviceId == "") {
                alert("PLEASE FILL IN THE 'deviceId' VARIABLE IN 'lampi.js'," +
                      " SAVE, AND REFRESH THE PAGE.  THE PAGE WILL NOT WORK " +
                      "CORRECTLY UNTIL YOU DO!");
                return;
            }

            setSliderValues(obj.lampState.color.h,
                obj.lampState.color.s,
                obj.lampState.brightness);

            obj.client.onConnectionLost = obj.onConnectionLost;
            obj.client.onMessageArrived = obj.onMessageArrived;

            obj.connect();

            $( "#power" ).click(obj.onPowerToggle);
            $( ".slider" ).on( "change input", obj.onSliderInput);
            $( ".slider" ).on( "mousedown touchstart", function() {
                obj.isManipulatingSlider = true; });
            $( window ).on( "mouseup mousecancel touchend touchcancel", function() {
                obj.isManipulatingSlider = false; });
        },
    };

    obj.init();
    return obj;
}

jQuery(LampiPage);

function update_media (info) {
  console.log("input received", info);

  media_url = info.url;
  attached_message = info.public_id.replace('smartframe/', '');

  media_detail = {
    media_url: media_url,
    message: attached_message
  };

  configJson = JSON.stringify(media_detail);

  client = new Paho.MQTT.Client(hostAddress, Number(hostPort), "upload_handler");

  client.onConnectionLost = onConnectionLost;
  // connect the client
  client.connect({onSuccess:onConnect});

  // called when the client connects
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    message = new Paho.MQTT.Message(configJson);
    message.destinationName = "devices/" + deviceId + "/smart_frame/update_media";
    message.qos = 1;
    client.send(message);
  }

  // called when the client loses its connection
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:"+responseObject.errorMessage);
    }
  }
}

