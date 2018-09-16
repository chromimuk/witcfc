var MapHelper = (function () {

    const leafletReference = L;

    let _divMap;
    let _myMap;
    let _markersCurrentlyOnMap = [];

    // init values
    const INIT_LATITUDE = 46.2276;
    const INIT_LONGITUDE = 2.2137;
    const INIT_ZOOM = 4;

    // layer options
    const minZoom = 1;
    const maxZoom = 18;
    const tileLayer = 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png';
    const attribution = '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>';





    function init(divMap) {
        _divMap = divMap;
        _myMap = leafletReference.map(_divMap);
        setup();
    }


    function setup() {
        leafletReference.tileLayer(tileLayer, {
            attribution: attribution,
            minZoom: minZoom,
            maxZoom: maxZoom
        }).addTo(_myMap);
    }

    function addMarker(coordinate, isOwnPosition) {

        if (coordinate === undefined)
            return;

        let marker;
        if (isOwnPosition === true) {
            marker = leafletReference.marker(coordinate.getCoordinates(), {
                icon: createRedIcon()
            });
        } else {
            marker = leafletReference.marker(coordinate.getCoordinates());
            marker.bindPopup(coordinate.description);
        }
        _markersCurrentlyOnMap.push(marker.addTo(_myMap));
    }

    function addMarkers(coordinates, shouldHighlight) {
        for (let coordinate of coordinates) {
            addMarker(coordinate, shouldHighlight);
        }
    }


    function createRedIcon() {
        return new L.Icon({
            iconUrl: 'leaflet/images/marker-icon-red.png',
            shadowUrl: 'leaflet/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }


    function cleanMarkers() {
        for (let marker of _markersCurrentlyOnMap) {
            marker.remove();
        }
        _markersCurrentlyOnMap = [];
    }

    function setView(latitude, longitude, zoom) {
        const lat = latitude || INIT_LATITUDE;
        const lon = longitude || INIT_LONGITUDE;
        const z = zoom || INIT_ZOOM;
        _myMap.setView(leafletReference.latLng(lat, lon), z, {
            animation: true
        });
    }


    return {
        init: init,
        addMarker: addMarker,
        addMarkers: addMarkers,
        cleanMarkers: cleanMarkers,
        setView: setView
    }

})();