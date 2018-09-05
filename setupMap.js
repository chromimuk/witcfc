const leafletReference = L;
const divMap = 'mapid';

let center = [46.2276, 2.2137]; // France
let zoom = 5;

const maxZoom = 18;
const attribution = '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>';

let markersCurrentlyOnMap = [];

// setup
let mymap = leafletReference.map(divMap).setView(center, zoom);

setup();



function setup() {
    const tileLayer = 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png';
    leafletReference.tileLayer(tileLayer, {
        attribution: attribution,
        minZoom: 1,
        maxZoom: 19
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
    markersCurrentlyOnMap.push(marker.addTo(mymap).bindPopup(coordinate.description));
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
    for (let marker of markersCurrentlyOnMap) {
        marker.remove();
    }
    markersCurrentlyOnMap = [];
}