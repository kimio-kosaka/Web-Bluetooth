var magnetometerDevice
// micro:bit 磁力サービス
const MAGNETOMETER_SERVICE_UUID = 'e95df2d8-251d-470a-a062-fa1922dfa9a8'
// micro:bit 磁力データキャラクタリスティック
const MAGNETOMETER_DATA_UUID = 'e95dfb11-251d-470a-a062-fa1922dfa9a8'
// micro:bit 磁力取得間隔キャラクタリスティック
const MAGNETOMETER_PERIOD_UUID = 'e95d386c-251d-470a-a062-fa1922dfa9a8'
// micro:bit 方角データキャラクタリスティック
const MAGNETOMETER_BEARING_UUID = 'e95d9715-251d-470a-a062-fa1922dfa9a8'
// コンパス読取りインターバル mS
const INTERVAL = 250

function connect () {
  navigator.bluetooth.requestDevice({
    filters: [{
      namePrefix: 'BBC micro:bit'
    }],
    optionalServices: [MAGNETOMETER_SERVICE_UUID]
  })
    .then(device => {
      magnetometerDevice = device
      console.log('device', device)
      return device.gatt.connect()
    })
    .then(server => {
      console.log('server', server)
      findMagnetometerService(server)
    })
    .catch(error => {
      alert('BLE接続に失敗しました。もう一度試してみてください')
      console.log(error)
    })
}

function disconnect () {
  if (!magnetometerDevice || !magnetometerDevice.gatt.connected) return
  magnetometerDevice.gatt.disconnect()
  alert('BLE接続を切断しました。')
  document.js.x.value = ''
}

function findMagnetometerService (server) {
  server.getPrimaryService(MAGNETOMETER_SERVICE_UUID)
    .then(service => {
      findMagnetometerPeriodCharacteristic(service)
      findMagnetometerBearingCharacteristic(service)
    })
    .catch(error => {
      console.log(error)
    })
}

function findMagnetometerPeriodCharacteristic (service) {
  service.getCharacteristic(MAGNETOMETER_PERIOD_UUID)
    .then(characteristic => {
      writeMagnetometerPeriodValue(characteristic)
    })
    .catch(error => {
      console.log(error)
    })
}

function writeMagnetometerPeriodValue (characteristic) {
  characteristic.writeValue(new Uint16Array([INTERVAL]))
    .catch(error => {
      console.log(error)
    })
}

function findMagnetometerBearingCharacteristic (service) {
  service.getCharacteristic(MAGNETOMETER_BEARING_UUID)
    .then(characteristic => {
      startMagnetometerBearingNotification(characteristic)
    })
    .catch(error => {
      console.log(error)
    })
}

function startMagnetometerBearingNotification (characteristic) {
  characteristic.startNotifications()
    .then(char => {
      console.log('Compass:', char)
      alert('BLE接続が完了しました。')
      characteristic.addEventListener('characteristicvaluechanged',
        onMagnetometerBearingChanged)
    })
}

function onMagnetometerBearingChanged (event) {
  let bearing = event.target.value.getUint16(0, true)
  // updateBearingValue(bearing)
  console.log('Heading:' + bearing)
  document.js.x.value = bearing
}
