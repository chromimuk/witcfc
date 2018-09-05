class Club {

    constructor(name, coordinates) {
        this._name = name;
        this._coordinates = coordinates;
    }

    get name() {
        return this._name;
    }
    get coordinates() {
        return this._coordinates;
    }

    isValid() {
        if (this._name.length === 0)
            return false;
        if (!this._coordinates.isValid())
            return false;
    }
}