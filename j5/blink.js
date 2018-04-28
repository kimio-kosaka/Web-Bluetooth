var five = require('johnny-five')

var board = new five.Board()

board.on('ready', function () {
  // Default to pin 13
  var led = new five.Led(13)
  led.blink(1000)
})

board.on('error', function (err) {
  browserbots.speak('HEY! ' + err)
  console.log('HEY! ' + err)
})
