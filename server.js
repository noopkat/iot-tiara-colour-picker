const skateboard = require('skateboard');
const IotClient = require('azure-iothub').Client;
const IotMessage = require('azure-iot-common').Message;

const iotClient = IotClient.fromConnectionString(process.env.IOT_CONN_STRING);

function makeColourBuffer(hex) {
  const buff = new Buffer(3);

  buff[0] = parseInt(hex.substr(0, 2), 16);
  buff[1] = parseInt(hex.substr(2, 2), 16);
  buff[2] = parseInt(hex.substr(4, 2), 16);

  console.log(buff);
  return buff;
}

function sendToDevice(msg) {
    const message = new IotMessage(msg);
    console.log('Sending message: ' + message.getData());
    iotClient.send(process.env.IOT_DEVICE_ID, message, printResultFor('send'));
}

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    } else {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}

iotClient.open(function(err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('IOT Client connected');
    skateboard({
      dir: __dirname + '/public',         
      port : process.env.PORT || 3000,                        
      transports: ['polling', 'websocket']
    }, function(stream) {
      console.log('skateboard connected');
      stream.on('data', function(colour) {
        const colourChoice = colour.substr(1);
        const buff = makeColourBuffer(colourChoice);
        sendToDevice(buff);
      });
    });
  }
});