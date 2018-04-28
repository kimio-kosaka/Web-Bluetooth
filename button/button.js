/* define Parameters **************************************************/
const DEVICE_NAME_PREFIX = 'BBC micro:bit'
const MAGNETOMETER_SERVICE_UUID = 'e95df2d8-251d-470a-a062-fa1922dfa9a8'
const    MAGNETOMETER_DATA_UUID = 'e95dfb11-251d-470a-a062-fa1922dfa9a8'
const  MAGNETOMETER_PERIOD_UUID = 'e95d386c-251d-470a-a062-fa1922dfa9a8'
const MAGNETOMETER_COMPASS_UUID = 'e95d9715-251d-470a-a062-fa1922dfa9a8'
// micro:bit ボタンサービス
const BUTTON_SERVICE_UUID = 'e95d9882-251d-470a-a062-fa1922dfa9a8'
// micro:bit ボタンAキャラクタリスティック
const BUTTON_A_DATA_UUID = 'e95dda90-251d-470a-a062-fa1922dfa9a8'
// micro:bit ボタンBキャラクタリスティック
const BUTTON_B_DATA_UUID = 'e95dda91-251d-470a-a062-fa1922dfa9a8'

// Messages
const MSG_CONNECTED = 'Connected'
const MSG_CONNECT_ERROR = 'Failed to Connect'
const MSG_DISCONNECTED = 'Disconnected'
/**********************************************************************/
// request connect  UUID
const SERVICE_UUID = BUTTON_SERVICE_UUID
const CHARACTERISTIC_UUID_1 = BUTTON_A_DATA_UUID
const CHARACTERISTIC_UUID_2 = BUTTON_B_DATA_UUID
// compass read interval mS
const INTERVAL = 250
// connected device value
var connectDevice

// disconnect process
function disconnect () {
  if (!connectDevice || !connectDevice.gatt.connected) return
  connectDevice.gatt.disconnect()
  alert(MSG_DISCONNECTED)
  postDisconnect()
}

// post disconnect process is here
function postDisconnect () {
  document.js.compass.value = ''
}

// connect process
function connect () {
  navigator.bluetooth.requestDevice({
    filters: [{
      namePrefix: DEVICE_NAME_PREFIX
    }],
    optionalServices: [SERVICE_UUID]
  })
    .then(device => {
      connectDevice = device
      console.log('device', device)
      return device.gatt.connect()
    })
    .then(server => {
      console.log('server', server)
      server.getPrimaryService(SERVICE_UUID)
        .then(service => {
          // start service is here
          startServiceA(service, CHARACTERISTIC_UUID_1) // set interval timer
          startServiceB(service, CHARACTERISTIC_UUID_2) // start commpass
        })
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

// set interval timer
function setPeriod (service, charUUID) {
  service.getCharacteristic(charUUID)
    .then(characteristic => {
      characteristic.writeValue(new Uint16Array([INTERVAL]))
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

// start service event
function startServiceA (service, charUUID) {
  service.getCharacteristic(charUUID)
    .then(characteristic => {
      characteristic.startNotifications()
        .then(char => {
          alert(MSG_CONNECTED)
          characteristic.addEventListener('characteristicvaluechanged',
            // event is here
            onButtonAChanged)
          console.log('Button:', char)
        })
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

function startServiceB (service, charUUID) {
  service.getCharacteristic(charUUID)
    .then(characteristic => {
      characteristic.startNotifications()
        .then(char => {
          alert(MSG_CONNECTED)
          characteristic.addEventListener('characteristicvaluechanged',
            // event is here
            onButtonBChanged)
          console.log('Button:', char)
        })
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}


// event handler
function onButtonAChanged (event) {
  let status = event.target.value.getUint8(0, true)
  // updateBearingValue(bearing)
  console.log('Status:' + status)
  document.js.compass.value = status
}
function onButtonBChanged (event) {
  let status = event.target.value.getUint8(0, true)
  // updateBearingValue(bearing)
  console.log('Status:' + status)
  document.js.compass.value = status
}
