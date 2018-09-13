class Club {

    constructor(name, coordinates, competition, website, crestURL) {
        this._name = name;
        this._coordinates = coordinates;
        this._competition = competition;
        this._website = website;
        this._crestURL = crestURL;
    }

    get name() {
        return this._name;
    }
    get coordinates() {
        return this._coordinates;
    }
    get competition() {
        return this._competition;
    }
    get website() {
        return this._website;
    }
    get crestURL() {
        return this._crestURL;
    }

    isValid() {
        if (this._name.length === 0)
            return false;
        if (!this._coordinates.isValid())
            return false;
        if (this._competition.length === 0)
            return false;
        if (this._website.length === 0)
            return false;
    }
}