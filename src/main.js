import ko from "knockout";
import axios from 'axios';
import mymap from "./js/mymap.js";
import _ from "lodash";
import "./css/app.css";

const map_weather_url = "http://restapi.amap.com/v3/weather/weatherInfo";
const map_s_key = "7478aa41ae36d35f3f8693d0452cd6ec";

//兴趣点名称数组
let poiArray = [];
// id-marker对象
let markerObj = {};
// info window
let infoWindow = new AMap.InfoWindow({
    offset: new AMap.Pixel(5, -30)
});
/**
 * @description  搜索兴趣点
 * @param {any} ko 
 * @param {any} vm 
 */
const searchPoi = function (ko, vm) {
    //搜索一些兴趣点
    AMap.service(["AMap.PlaceSearch"], function () {
        var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
            type: "风景名胜",
            pageSize: 30,
            pageIndex: 1,
            city: "020", //城市
            map: mymap
        });
        //关键字查询
        placeSearch.search("", function (status, result) {
            mymap.setZoom(11);
            if (result && result.poiList && result.poiList.pois) {
                // 获取地图上所有marker对象
                let allMarkers = mymap.getAllOverlays("marker");
                for (const poi of result.poiList.pois) {
                    poiArray.push(poi);
                    for (const marker of allMarkers) {
                        let markerId = poi.id;
                        if (markerId === marker.Xf) {
                            // 调用Web API进行天气查询
                            let adcode = poi.adcode;
                            let markerName = poi.name;
                            let address = poi.address;
                            axios.get(map_weather_url, {
                                    params: {
                                        key: map_s_key,
                                        city: adcode,
                                        extensions: "base",
                                        output: "JSON"
                                    }
                                })
                                .then(function (response) {
                                    let weatherInfo = response.data.lives[0];
                                    let temperature = weatherInfo.temperature;
                                    let weather = weatherInfo.weather;
                                    let content = `<div><span style="color: #800080;">${markerName}</span><br/><span>地址: ${address}</span><br/><span>当前气温: 摄氏${temperature}度/${weather}</span></div>`;
                                    marker.content = content;
                                    //bind click event for marker
                                    marker.on('click', markerClick);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    return `<div style="color: red;">抱歉，没有查询到相关天气信息</div>`;
                                });
                            // 设置对象
                            markerObj[markerId] = marker;
                        }
                    }
                }
                // 应用ko绑定
                ko.applyBindings(vm);
            }
        });
    })
}

/**
 * @description  marker点击事件
 * @param {any} e 
 */
let markerClick = function (e) {
    infoWindow.setContent(e.target.content);
    infoWindow.open(mymap, e.target.getPosition());
}

/**
 * @description  构建knockout ViewModel对象
 * @param {any} searchInput 搜索文本框
 * @param {any} poiArray 兴趣点数组
 */
let ViewModel = function (searchInput, poiArray) {
    this.searchTxt = ko.observable(searchInput);
    this.markers = ko.observableArray(poiArray);
    // 搜索按钮点击事件
    this.searchEvent = function () {
        mymap.clearMap();
        let keyword = this.searchTxt();
        let keywordMarkerArray = [];
        for (const poi of poiArray) {
            if (isPoiContainKeyword(poi.name, keyword)) {
                let markerId = poi.id;
                let mymarker = markerObj[markerId];
                keywordMarkerArray.push(mymarker);
            }
        }
        mymap.add(keywordMarkerArray);
        mymap.setFitView();
        closeDrawer();
    };
    // Poi列表点击事件
    this.navItemClick = function (el) {
        // console.log(el);
        mymap.clearMap();
        let markerId = el.id;
        let mymarker = markerObj[markerId];
        mymap.add(mymarker);
        mymap.setFitView();
        closeDrawer();
    };
    // 输入搜索字符串keyPress事件
    this.searchPress = function () {
        let searchChar = this.searchTxt();
        let filterArray = _.filter(poiArray, function (marker) {
            if (!marker.name) {
                return;
            }
            return isPoiContainKeyword(marker.name, searchChar);
        });
        this.markers(filterArray);
    }
};

/**
 * @description 判断poi名称是否包含搜索关键字
 * @param {any} name 
 * @param {any} searchChar 
 * @returns 
 */
let isPoiContainKeyword = function (name, searchChar) {
    return name.indexOf(searchChar) > -1;
}

/**
 * @description 隐藏侧边栏
 */
let closeDrawer = function () {
    document.querySelector(".mdl-layout__drawer").classList.remove("is-visible");
    document.querySelector(".mdl-layout__obfuscator").classList.remove("is-visible");
}

//初始化查询所有兴趣点
searchPoi(ko, new ViewModel("", poiArray));