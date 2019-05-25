let userData = {
  collector: 2,
  coolDownGrid: []
}

var mapGridData = [
  {
    "type": "Feature",
    "properties": {
      "maxLat": 23,
      "maxLng": 120.22,
      "name" : "test",
      "density": 50,
      "resources": {
        "木頭": 1200,
        "石板": 1000,
        "鋼鐵": 300,
        "銅礦": 100
      }
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
      "resources": {
        "木頭": 1200,
        "石板": 1000,
        "鋼鐵": 300,
        "銅礦": 40
      }
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
      "maxLng": 120.24,
      "name" : "test",
      "density": 300,
      "resources": {
        "木頭": 1200,
        "石板": 1000,
        "鋼鐵": 300,
        "銅礦": 100
      }
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [120.24, 23.02],
          [120.23, 23.02],
          [120.23, 23.01],
          [120.24, 23.01],
          [120.24, 23.02]
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
      "resources": {
        "木頭": 90,
        "石板": 40,
        "鋼鐵": 30,
        "銅礦": 0
      }
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

var options = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0
};

function init () {
  navigator.geolocation.getCurrentPosition(drawMap, error, options)
  navigator.geolocation.watchPosition(update, error, options)
}

function error (err) {
  console.warn('ERROR(' + err.code + '): ' + err.message)
  console.log('太久囉')
  let pos = {
    coords: {
      longitude: 120.21575,
      latitude: 22.99962
    }
  }
  drawMap(pos)
}

function update (pos) {
  console.log(pos.coords.latitude)
  console.log(pos.coords.longitude)
  lat = pos.coords.latitude
  lng = pos.coords.longitude
  marker.setLatLng([lat, lng])
  console.log(marker)
}

async function drawMap (pos) {
  lat = pos.coords.latitude
  lng = pos.coords.longitude
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
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1IjoibGVva3VvMDcyNCIsImEiOiJjanZ6YzltbXUwcDVoM3pyNmI0aGp5N29tIn0.xjdaery7ZqnxkZhbktidYQ'
  }).addTo(mymap)

  marker = L.marker([lat, lng]).addTo(mymap)
  drawGeoJSON()
}

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
    this._div.innerHTML = '<h4>地表資源資訊</h4>' + (props ?
      '已被採集'+ props.density + '次<br>' +
      '<b>剩餘資源: </b><br>' + 
      '木頭: ' + props.resources.木頭 +'<br>' +
      '石板: ' + props.resources.石板 +'<br>' +
      '鋼鐵: ' + props.resources.鋼鐵 +'<br>' +
      '銅礦: ' + props.resources.銅礦 +'<br>' +
      props.maxLat+','+props.maxLng
      : '<p style="margin: 0px">請點擊土地框格</p>')
  }
  info.addTo(mymap)
}

function createVisiableAreaData () {
  let maxLat = Math.ceil(lat * 100) / 100
  let maxLng = Math.ceil(lng * 100) / 100
  let locationGridArr = []
  let gap = 0.01
  for(var i=-2; i<3; i++){
    for(var j=-2; j<3; j++){
      let checkLat = Math.ceil((maxLat+(i * gap)) * 100) / 100
      let checkLng = Math.ceil((maxLng+(j * gap)) * 100) / 100
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
            "resources": {
              "木頭": 2000,
              "石板": 1800,
              "鋼鐵": 1200,
              "銅礦": 800
            }
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

function style(feature) {
  return {
    fillColor: getColor(feature.properties.density),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.3
  }
}

function getColor(d) {
  return d > 1000 ? '#800026' :
         d > 500  ? '#BD0026' :
         d > 100  ? '#E31A1C' :
         d > 50   ? '#FC4E2A' :
         d > 20   ? '#FD8D3C' :
         d > 10   ? '#FEB24C' :
         d > 5    ? '#FED976' :
                    '#FFEDA0'
}

function highlightFeature(e) {
  mymap.fitBounds(e.target.getBounds())
  geojson.setStyle({
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.3
  })

  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.5
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

function isCollectable () {
  if (userData.collector > 0){
    console.log('收集器足夠')
    let maxLat = Math.ceil(lat * 100) / 100
    let maxLng = Math.ceil(lng * 100) / 100
    // 判斷有沒有在冷卻陣列中
    let index = userData.coolDownGrid.findIndex(ele => { return ele.maxLat === maxLat && ele.maxLng === maxLng })
    if ( index >= 0){ // 若有在冷卻陣列，判斷是否已經結束冷卻
      if (userData.coolDownGrid[index].finishTime <= Date.now()) { // 已經結束冷卻，可以再收集一次
        // 先刪掉原先存在陣列中的
        userData.coolDownGrid.splice(index, 1)
        console.log(userData.coolDownGrid)
        // 執行採集
        collect()
      } else { // 尚未結束冷卻，還不能採集
        console.log('還在冷卻')
      }
    } else {
      collect()
    }
  } else {
    console.log('收集器不夠')
  }
}

function collect () {
  geojson.clearLayers()
  userData.collector--

  let maxLat = Math.ceil(lat * 100) / 100
  let maxLng = Math.ceil(lng * 100) / 100
  // 加到使用者自己冷卻陣列中
  userData.coolDownGrid.push({
    maxLat: maxLat,
    maxLng: maxLng,
    finishTime: Date.now() + 100000000
  })

  // 更改資料庫mapGridData資料
  let index = mapGridData.findIndex(ele => {
    return ele.properties.maxLat === maxLat && ele.properties.maxLng === maxLng
  })
  if (index >= 0) { // 原本該格有存在資料庫中
    mapGridData[index].properties.density++
    mapGridData[index].properties.resources.木頭 -= 300
    console.log(mapGridData)
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
        "resources": {
          "木頭": 2000,
          "石板": 1800,
          "鋼鐵": 1200,
          "銅礦": 800
        }
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
    newGrid.properties.resources.木頭 -= 300
    mapGridData.push(newGrid)
    geojson.addData(createVisiableAreaData())
  }
}

init()