document.getElementById('mapid').style.width = document.body.clientWidth + 'px'
document.getElementById('mapid').style.height = document.body.clientHeight + 'px'

let userData = {
  detectRange: 3,
  collectAbility: 100,
  collectorMax: 2,
  coolDownGrid: [],
  resources: [
    {
      type: '木頭',
      amount: 0
    },
    {
      type: '鋼鐵',
      amount: 0
    },
    {
      type: '銅礦',
      amount: 0
    },
    {
      type: '石板',
      amount: 0
    }
  ]
}

var mapGridData = [
  {
    "type": "Feature",
    "properties": {
      "maxLat": 23,
      "maxLng": 120.22,
      "name" : "test",
      "density": 50,
      "respawnTime": Date.now() + 10000000,
      "storage": [
        {
          "type" : "木頭",
          "amount" : 2000
        },
        {
          "type" : "石板",
          "amount" : 1600
        },
        {
          "type" : "鋼鐵",
          "amount" : 1000
        },
        {
          "type" : "銅礦",
          "amount" : 400
        }
      ]
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [120.22, 23],
          [120.21, 23],
          [120.21, 22.99],
          [120.22, 22.99],
          [120.22, 23]
        ]
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "maxLat": 23.02,
      "maxLng": 120.22,
      "name" : "test", 
      "density": 2,
      "respawnTime": null,
      "storage": [
        {
          "type" : "木頭",
          "amount" : 2000
        },
        {
          "type" : "石板",
          "amount" : 1600
        },
        {
          "type" : "鋼鐵",
          "amount" : 1000
        },
        {
          "type" : "銅礦",
          "amount" : 400
        }
      ]
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [120.22, 23.02],
          [120.21, 23.02],
          [120.21, 23.01],
          [120.22, 23.01],
          [120.22, 23.02]
        ]
      ]
    }
  },
  {
    "type": "Feature",
    "properties": { 
      "maxLat": 23.02,
      "maxLng": 120.23,
      "name" : "test",
      "density": 300,
      "respawnTime": null,
      "storage": [
        {
          "type" : "木頭",
          "amount" : 100
        },
        {
          "type" : "石板",
          "amount" : 0
        },
        {
          "type" : "鋼鐵",
          "amount" : 100
        },
        {
          "type" : "銅礦",
          "amount" : 0
        }
      ]
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [120.23, 23.02],
          [120.22, 23.02],
          [120.22, 23.01],
          [120.23, 23.01],
          [120.23, 23.02]
        ]
      ]
    }
  },
  {
    "type": "Feature",
    "properties": { 
      "maxLat": 23,
      "maxLng": 120.24,
      "name" : "test",
      "density": 32,
      "respawnTime": null,
      "storage": [
        {
          "type" : "木頭",
          "amount" : 2000
        },
        {
          "type" : "石板",
          "amount" : 1600
        },
        {
          "type" : "鋼鐵",
          "amount" : 1000
        },
        {
          "type" : "銅礦",
          "amount" : 400
        }
      ]
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [120.24, 23],
          [120.23, 23],
          [120.23, 22.99],
          [120.24, 22.99],
          [120.24, 23]
        ]
      ]
    }
  }
]

let mymap
let geojson
let info
let lng, lat
let marker
let watcher

var options = {
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 0,
  distanceFilter: 1
};
var accurateOptions = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 0,
  distanceFilter: 1
};

function init () {
  navigator.geolocation.getCurrentPosition(drawMap, error, options)
  watcher = navigator.geolocation.watchPosition(update, error, options)
}

function improveGPS () {
  if (watcher) {
    navigator.geolocation.clearWatch(watcher)
    watcher = navigator.geolocation.watchPosition(update, error, accurateOptions)
  }
}

function error (err) {
  console.warn('ERROR(' + err.code + '): ' + err.message)
  console.log('太久囉')
  // 之後拿掉以下
  let pos = {
    coords: {
      longitude: 120.21575,
      latitude: 22.99962
    }
  }
  drawMap(pos)
}

// 根據移動改變座標
function update (pos) {
  lat = pos.coords.latitude
  lng = pos.coords.longitude
  marker.setLatLng([lat, lng])

  if(geojson){
    geojson.clearLayers()
    geojson.addData(createVisiableAreaData())
  }
}

// 初始化地圖
async function drawMap (pos) {
  lat = pos.coords.latitude
  lng = pos.coords.longitude
  if(mymap){mymap.remove()}
  mymap = L.map('mapid', {
    center: [lat, lng],
    zoom: 16,
    zoomControl: false
  })
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      minZoom: 8,
      errorTilrUrl: 'http://bpic.588ku.com/element_pic/16/12/07/706f7ff4f15725b17ba1d30d384e6468.jpg',
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibGVva3VvMDcyNCIsImEiOiJjanZ6YzltbXUwcDVoM3pyNmI0aGp5N29tIn0.xjdaery7ZqnxkZhbktidYQ'
  }).addTo(mymap)

  marker = L.marker([lat, lng]).addTo(mymap)
  drawGeoJSON()
}

// 繪製geojson
async function drawGeoJSON () {
  geojson = L.geoJSON(createVisiableAreaData(), {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(mymap)

  info = L.control()
  info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info')
    this.update()
    return this._div
  }

  info.update = function (props) {
    checkGridStatus()
    let displayContent
    if (props) {
      if (props.respawnTime) { // 還沒respawn
        displayContent = '波波拉失控區域，等待資源重生<br>剩餘秒數: ' +  (props.respawnTime - Date.now())
      } else {
        displayContent = 
        '已被採集'+ props.density + '次<br>' +
        '<b>剩餘資源: </b><br>' + 
        props.storage[0].type + ': ' + props.storage[0].amount +'<br>' +
        props.storage[1].type + ': ' + props.storage[1].amount +'<br>' +
        props.storage[2].type + ': ' + props.storage[2].amount +'<br>' +
        props.storage[3].type + ': ' + props.storage[3].amount +'<br>' +
        props.maxLat+','+props.maxLng
      }
    } else {
      displayContent = '<p style="margin: 0px">請點擊土地框格</p>'
    }
    this._div.innerHTML = '<h4>地表資源資訊</h4>' + displayContent
  }
  info.addTo(mymap)
}

// 創建可偵查區域的geojson data
function createVisiableAreaData () {
  let maxLat = Math.ceil(lat * 100) / 100
  let maxLng = Math.ceil(lng * 100) / 100
  let locationGridArr = []
  let gap = 0.01
  let range = Math.floor(userData.detectRange / 2)
  checkGridStatus()

  for(var i=-range; i<=range; i++){
    for(var j=-range; j<=range; j++){
      let checkLat = Math.round((maxLat+(i * gap)) * 100) / 100
      let checkLng = Math.round((maxLng+(j * gap)) * 100) / 100
      // 找已儲存陣列中是否有符合的
      let index = mapGridData.findIndex(ele => {
        return ele.properties.maxLat === checkLat && ele.properties.maxLng === checkLng
      })
      if (index >= 0) {
        locationGridArr.push(mapGridData[index])
      } else {
        let basicGrid = {
          "type": "Feature",
          "properties": {
            "maxLat": checkLat,
            "maxLng": checkLng,
            "name" : "test",
            "density": 0,
            "respawnTime" : null,
            "storage": [
              {
                "type" : "木頭",
                "amount" : 2000
              },
              {
                "type" : "石板",
                "amount" : 1600
              },
              {
                "type" : "鋼鐵",
                "amount" : 1000
              },
              {
                "type" : "銅礦",
                "amount" : 400
              }
            ]
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [checkLng, checkLat],
                [checkLng-gap, checkLat],
                [checkLng-gap, checkLat-gap],
                [checkLng, checkLat-gap],
                [checkLng, checkLat]
              ]
            ]
          }
        }
        locationGridArr.push(basicGrid)
      }
    }
  }
  return locationGridArr
}

// 給予方格樣式
function style(feature) {
  return {
    fillColor: getColor(feature.properties.density),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.2
  }
}

// 根據資源採集數給予顏色分級
function getColor(d) {
  return d > 50  ?  '#680A64' :
         d > 35  ?  '#8A2584' :
         d > 20  ?  '#A842A4' :
         d > 15  ?  '#C964C5' :
         d > 10  ?  '#E881E4' :
         d > 5   ?  '#FCA8FA' :
                    '#FEDDFD'
}

// 點擊方格時，給予清楚顏色標記
function highlightFeature(e) {
  mymap.fitBounds(e.target.getBounds())
  geojson.setStyle({
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.2
  })

  var layer = e.target;

  layer.setStyle({
    weight: 3,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.3
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront()
  }

  info.update(layer.feature.properties)
}

function resetHighlight(e) {
  geojson.resetStyle(e.target)
  info.update()
}

function onEachFeature(feature, layer) {
  layer.on({
      // mouseover: highlightFeature,
      // mouseout: resetHighlight,
      click: highlightFeature
  });
}

// 檢查是否可以進行採集
async function ifCollectable () {
  let maxLat = Math.ceil(lat * 100) / 100
  let maxLng = Math.ceil(lng * 100) / 100
  
  await checkGridStatus ()
  let thiesGridIndex = mapGridData.findIndex(ele => { return ele.properties.maxLat === maxLat && ele.properties.maxLng === maxLng })
  if (thiesGridIndex !== -1 && mapGridData[thiesGridIndex].properties.respawnTime) { // 正在波波拉失控
    console.log('波波拉失控中，無法採集')
    return
  } else {
    // 檢查是否有足夠的採集器
    await checkUserCoolDown() // 根據該時間，先行對冷卻格子做修正
    let collectorAmount = userData.collectorMax - userData.coolDownGrid.length
    if (collectorAmount > 0){
      console.log('收集器足夠')
      // 判斷該格有沒有在冷卻陣列中
      let index = userData.coolDownGrid.findIndex(ele => { return ele.maxLat === maxLat && ele.maxLng === maxLng })
      if (index >= 0) { // 該格還在冷卻
        console.log('還在冷卻')
      } else {
        collect()
      }
    } else {
      console.log('收集器不夠')
    }
  }
}

// 檢查格子是否還有資源(沒有的話是正在波波拉失控狀態)
function checkGridStatus () {
  mapGridData = mapGridData.filter(ele => {
    return ele.properties.respawnTime === null || ele.properties.respawnTime > Date.now()
  })
  console.log(mapGridData)
}

// 檢查正在玩家正在冷卻的格子
function checkUserCoolDown () {
  userData.coolDownGrid = userData.coolDownGrid.filter(ele => {
    return ele.finishTime >= Date.now()
  })
}

// 進行採集
function collect () {
  geojson.clearLayers()
  info.update()
  
  let maxLat = Math.ceil(lat * 100) / 100
  let maxLng = Math.ceil(lng * 100) / 100
  // 加到使用者自己冷卻陣列中
  userData.coolDownGrid.push({
    maxLat: maxLat,
    maxLng: maxLng,
    finishTime: Date.now() + 100
  })

  // 更改資料庫mapGridData資料
  let index = mapGridData.findIndex(ele => {
    return ele.properties.maxLat === maxLat && ele.properties.maxLng === maxLng
  })
  if (index >= 0) { // 原本該格有存在資料庫中
    mapGridData[index].properties.density++
    // mapGridData[index].properties.storage.木頭 -= 300
    storageToResource(mapGridData[index])
    console.log(mapGridData[index])
    geojson.addData(createVisiableAreaData())
  } else { //原本沒存在，需要增加新的物件於陣列中，並刪除定量資源
    let gap = 0.01
    let newGrid = {
      "type": "Feature",
      "properties": {
        "maxLat": maxLat,
        "maxLng": maxLng,
        "name" : "test",
        "density": 0,
        "respawnTime": null,
        "storage": [
          {
            "type" : "木頭",
            "amount" : 2000
          },
          {
            "type" : "石板",
            "amount" : 1600
          },
          {
            "type" : "鋼鐵",
            "amount" : 1000
          },
          {
            "type" : "銅礦",
            "amount" : 400
          }
        ]
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [maxLng, maxLat],
            [maxLng-gap, maxLat],
            [maxLng-gap, maxLat-gap],
            [maxLng, maxLat-gap],
            [maxLng, maxLat]
          ]
        ]
      }
    }
    newGrid.properties.density++
    storageToResource(newGrid)
    mapGridData.push(newGrid)
    console.log(mapGridData)
    geojson.addData(createVisiableAreaData())
  }
  centerOn() // 回到定位中心
}

function storageToResource (gridData) {
  getAmount(gridData, 0, 1)
  getAmount(gridData, 1, 0.8)
  getAmount(gridData, 2, 0.5)
  getAmount(gridData, 3, 0.2)

  shutdownGrid(gridData)
}

function getAmount (gridData, index, proportion) {
  let addAmount
  if (gridData.properties.storage[index].amount - userData.collectAbility * proportion >= 0) { // 足量，可以採集
    addAmount = userData.collectAbility * proportion
    gridData.properties.storage[index].amount -= userData.collectAbility * proportion
  } else { // 不足，只能拿剩下的
    addAmount = gridData.properties.storage[index].amount
    gridData.properties.storage[index].amount = 0
  }
  
  userData.resources.map(ele => {
    if(ele.type === gridData.properties.storage[index].type){
      return ele.amount += addAmount
    }
  })
}

function shutdownGrid (gridData) {
  let stillHaveStorage = gridData.properties.storage.filter(ele => {return ele.amount > 0}).length
  if (stillHaveStorage === 0) {
    let time = 10000
    gridData.properties.respawnTime = Date.now() + time
    setTimeout(()=>{
      geojson.clearLayers()
      geojson.addData(createVisiableAreaData())
    },time)
  }
}

// 回到中心
function centerOn () {
  mymap.panTo([lat, lng])
}

init()