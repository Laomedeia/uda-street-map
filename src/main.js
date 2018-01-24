import ko from "knockout";
import mymap from "./js/mymap.js";
import _ from "lodash";
import "./css/app.css";

//兴趣点名称数组
let poiArray = [];
// id-marker对象
let markerObj = {};

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
            console.log(mymap.getZoom());
            mymap.setZoom(11);
            if (result && result.poiList && result.poiList.pois) {
                // 获取地图上所有marker对象
                let allMarkers = mymap.getAllOverlays("marker");
                for (const poi of result.poiList.pois) {
                    poiArray.push(poi);
                    for (const marker of allMarkers) {
                        let markerId = poi.id;
                        if (markerId === marker.Xf) {
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
            if (isPoiContainKeyword(poi, keyword)) {
                let markerId = poi.id;
                let mymarker = markerObj[markerId];
                keywordMarkerArray.push(mymarker);
            }
        }
        //地图上显示过滤后的poi点
        // console.log(keywordMarkerArray);
        // for (const keywordMarker of keywordMarkerArray) {
        //     let label = keywordMarker.name;
        //     console.log(label);
        //     var marker = new AMap.Marker({ //加点
        //         map: mymap,
        //         label: {
        //             content: label,
        //             offset: new AMap.Pixel(20, 20)
        //         },
        //         animation: "AMAP_ANIMATION_DROP",
        //         clickable: true,
        //         position: [keywordMarker.location.lng, keywordMarker.location.lat]
        //     });
        // }
        // console.log(keywordMarkerArray);
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
        console.log(mymap);
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
            return isPoiContainKeyword(marker, searchChar);
        });
        this.markers(filterArray);
    }
};

//判断poi名称是否包含搜索关键字
let isPoiContainKeyword = function (marker, searchChar) {
    let name = marker.name;
    return name.indexOf(searchChar) > -1;
}

//隐藏侧边栏
let closeDrawer = function() {
    document.querySelector(".mdl-layout__drawer").classList.remove("is-visible");
    document.querySelector(".mdl-layout__obfuscator").classList.remove("is-visible");
}

//初始化查询所有兴趣点
searchPoi(ko, new ViewModel("", poiArray));