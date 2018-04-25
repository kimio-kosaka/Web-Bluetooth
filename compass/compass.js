/* define Service UUID */
// micro:bit 磁力サービス
const MAGNETOMETER_SERVICE_UUID = 'e95df2d8-251d-470a-a062-fa1922dfa9a8'
// micro:bit 磁力データキャラクタリスティック
const MAGNETOMETER_DATA_UUID = 'e95dfb11-251d-470a-a062-fa1922dfa9a8'
// micro:bit 磁力取得間隔キャラクタリスティック
const MAGNETOMETER_PERIOD_UUID = 'e95d386c-251d-470a-a062-fa1922dfa9a8'
// micro:bit 方角データキャラクタリスティック
const MAGNETOMETER_COMPASS_UUID = 'e95d9715-251d-470a-a062-fa1922dfa9a8'

// request connect service UUID
const SERVICE_UUID = MAGNETOMETER_SERVICE_UUID
// コンパス読取りインターバル mS
const INTERVAL = 250

var ConnectDevice

// discnnect process
function disconnect () {
  if (!ConnectDevice || !ConnectDevice.gatt.connected) return
  ConnectDevice.gatt.disconnect()
  alert('BLE接続を切断しました。')
  // post disconnect process is here
  document.js.compass.value = ''
}

// connect process
function connect () {
  navigator.bluetooth.requestDevice({
    filters: [{
      namePrefix: 'BBC micro:bit'
    }],
    optionalServices: [SERVICE_UUID]
  })
    .then(device => {
      ConnectDevice = device
      console.log('device', device)
      return device.gatt.connect()
    })
    .then(server => {
      console.log('server', server)
      server.getPrimaryService(SERVICE_UUID)
        .then(service => {
          // start service is here
          setPeriod(service) // set interbval timer
          startCompass(service) // start commpass
        })
    })
    .catch(error => {
      alert('BLE接続に失敗しました。もう一度試してみてください')
      console.log(error)
    })
}

// set interval time
function setPeriod (service) {
  service.getCharacteristic(MAGNETOMETER_PERIOD_UUID)
    .then(characteristic => {
      characteristic.writeValue(new Uint16Array([INTERVAL]))
        .catch(error => {
          console.log(error)
        })
    })
    .catch(error => {
      console.log(error)
    })
}

// start Compass
function startCompass (service) {
  service.getCharacteristic(MAGNETOMETER_COMPASS_UUID)
    .then(characteristic => {
      characteristic.startNotifications()
        .then(char => {
          console.log('Compass:', char)
          alert('BLE接続が完了しました。')
          characteristic.addEventListener('characteristicvaluechanged',
            onCompassChanged)
        })
    })
    .catch(error => {
      console.log(error)
    })
}

// get and put Compass data
function onCompassChanged (event) {
  let bearing = event.target.value.getUint16(0, true)
  // updateBearingValue(bearing)
  console.log('Heading:' + bearing)
  document.js.compass.value = bearing
}
