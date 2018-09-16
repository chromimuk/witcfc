class Latitude {
    constructor(latitude) {
        this._value = latitude;
    }
    get value() {
        return this._value;
    }
    isValid() {
        return Math.abs(this._value) <= 90;
    }
}

class Longitude {
    constructor(longitude) {
        this._value = longitude;
    }
    get value() {
        return this._value;
    }
    isValid() {
        return Math.abs(this._value) <= 180;
    }
}


class Coordinate {

    constructor(lat, lon, description) {
        this._latitude = new Latitude(lat);
        this._longitude = new Longitude(lon);
        this._description = description;
    }

    getCoordinates() {
        return [this._latitude.value, this._longitude.value];
    }
    get description() {
        return this._description;
    }

    static getDefaultDescription() {
        return "";
    }

    isValid() {
        return this._latitude.isValid() && this._longitude.isValid();
    }
}