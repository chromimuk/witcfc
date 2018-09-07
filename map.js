var MapHelper = (function () {

    const leafletReference = L;

    let _divMap;
    let _markersCurrentlyOnMap = [];

    // init values
    const center = [46.2276, 2.2137]; // France
    const zoom = 5;

    // layer options
    const minZoom = 1;
    const maxZoom = 18;
    const tileLayer = 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png';
    const attribution = '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>';





    function init(divMap) {

        _divMap = divMap;
        mymap = leafletReference.map(_divMap).setView(center, zoom);

        setup();
    }


    function setup() {
        leafletReference.tileLayer(tileLayer, {
            attribution: attribution,
            minZoom: minZoom,
            maxZoom: maxZoom
        }).addTo(mymap);
    }

    function addMarker(coordinate, shouldHighlight) {
        let marker;
        if (shouldHighlight === true) {
            marker = leafletReference.marker(coordinate.getCoordinates(), {
                icon: createRedIcon()
            });
        } else {
            marker = leafletReference.marker(coordinate.getCoordinates());
        }
        _markersCurrentlyOnMap.push(marker.addTo(mymap).bindPopup(coordinate.description));
    }

    function addMarkers(coordinates, shouldHighlight) {
        for (let coordinate of coordinates)
        {
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


    return {
        init: init,
        addMarker: addMarker,
        addMarkers: addMarkers,
        cleanMarkers: cleanMarkers
    }

})();