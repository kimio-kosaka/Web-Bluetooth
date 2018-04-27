/* define Parameters **************************************************************/
// BLEデバイス名接頭句
const DEVICE_NAME_PREFIX = 'BBC micro:bit'
// micro:bit BLE IO Pin UUID
const IOPINSERVICE_SERVICE_UUID = 'E95D127B-251D-470A-A062-FA1922DFA9A8'
const PINDATA_CHARACTERISTIC_UUID = 'E95D8D00-251D-470A-A062-FA1922DFA9A8'
const PINADCONFIGURATION_CHARACTERISTIC_UUID = 'E95D5899-251D-470A-A062-FA1922DFA9A8'
const PINIOCONFIGURATION_CHARACTERISTIC_UUID = 'E95DB9FE-251D-470A-A062-FA1922DFA9A8'

// Messages
const MSG_CONNECTED = 'BLE接続が完了しました。'
const MSG_CONNECT_ERROR = 'BLE接続に失敗しました。もう一度試してみてください'
const MSG_DISCONNECTED = 'BLE接続を切断しました。'
/*********************************************************************************/
// for connection process
const SERVICE_UUID = IOPINSERVICE_SERVICE_UUID
const AD_CONFIG_UUID = PINADCONFIGURATION_CHARACTERISTIC_UUID
const IO_CONFIG_UUID = PINIOCONFIGURATION_CHARACTERISTIC_UUID
const PINDATA_UUID = PINDATA_CHARACTERISTIC_UUID
// connected device value
var connectDevice

// disconnect process
function disconnect () {
  if (!connectDevice || !connectDevice.gatt.connected) return
  connectDevice.gatt.disconnect()
  alert(MSG_DISCONNECTED)
  postDisconnect()
}

function postDisconnect () {
  document.js.x.value = ''
  document.js.y.value = ''
  document.js.z.value = ''
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
          setADconfig(service, AD_CONFIG_UUID)
          setIOconfig(service, IO_CONFIG_UUID)
          // startService(service, PINDATA_UUID) // start service
        })
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

function setADconfig (service, charUUID) {
  var adFlag = 0x00
  service.getCharacteristic(charUUID)
    .then(characteristic => {
      characteristic.writeValue(adFlag)
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

function setIOconfig (service, charUUID) {
  var ioFlagOut = 0x00
  service.getCharacteristic(charUUID)
    .then(characteristic => {
      characteristic.writeValue(ioFlagOut)
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

function onLED () {

}

function offLED () {

}

// start service event
function startService (service, charUUID) {
  service.getCharacteristic(charUUID)
    .then(characteristic => {
      characteristic.startNotifications()
        .then(char => {
          alert(MSG_CONNECTED)
          characteristic.addEventListener('characteristicvaluechanged',
            // event is here
            onAccelerometerValueChanged)
          console.log('Accelerometer:', char)
        })
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

// event handler
function onAccelerometerValueChanged (event) {
  var AcceleratorX = event.target.value.getUint16(0) / 1000.0
  console.log('x:' + AcceleratorX)
  document.js.x.value = AcceleratorX
  var AcceleratorY = event.target.value.getUint16(2) / 1000.0
  console.log('y:' + AcceleratorY)
  document.js.y.value = AcceleratorY
  var AcceleratorZ = event.target.value.getUint16(4) / 1000.0
  console.log('z:' + AcceleratorZ)
  document.js.z.value = AcceleratorZ
}
