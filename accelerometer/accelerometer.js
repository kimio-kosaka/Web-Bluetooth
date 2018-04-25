
// micro:bit BLE Accelerometer UUID
const     ACCELEROMETERSERVICE_SERVICE_UUID = 'e95d0753-251d-470a-a062-fa1922dfa9a8'
const ACCELEROMETERDATA_CHARACTERISTIC_UUID = 'e95dca4b-251d-470a-a062-fa1922dfa9a8'

const SERVICE_UUID = ACCELEROMETERSERVICE_SERVICE_UUID
var ConnectDevice

// discnnect process
function disconnect () {
  if (!ConnectDevice || !ConnectDevice.gatt.connected) return
  ConnectDevice.gatt.disconnect()
  alert('BLE接続を切断しました。')
  document.js.x.value = ''
  document.js.y.value = ''
  document.js.z.value = ''
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
          startAccelerometer(service) // start Accelerometer
        })
    })
    .catch(error => {
      alert('BLE接続に失敗しました。もう一度試してみてください')
      console.log(error)
    })
}

function startAccelerometer (service) {
  service.getCharacteristic(ACCELEROMETERDATA_CHARACTERISTIC_UUID)
    .then(characteristic => {
      characteristic.startNotifications()
        .then(char => {
          console.log('Accelerometer:', char)
          alert('BLE接続が完了しました。')
          characteristic.addEventListener('characteristicvaluechanged',
            onAccelerometerValueChanged)
        })
    })
    .catch(error => {
      console.log(error)
    })
}

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
