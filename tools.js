var Tools = (function () {
    function isInteger(element) {
        return /^-?[0-9]+$/.test(element);
    }

    return {
        isInteger: isInteger
    };
})();


var GeoLocTools = (function () {

    function getCoordinatesFromNavigator(callbackSuccess, callbackFail) {
        HtmlHelper.clearLocationInput();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(callbackSuccess, callbackFail);
        } else {
            callbackFail();
        }
    }

    function getCoordinatesFromLocation(location, callbackSuccess, callbackFail) {

        const baseURL = 'https://nominatim.openstreetmap.org/search?';
        const args = [
            'format=json', // Output format
            `q=${location}`, // Query string to search for
            'addressdetails=1', // Include a breakdown of the address into elements
            'limit=1' // limit the number of returned results 
        ];
        const url = `${baseURL}${args.join('&')}`;

        fetch(url).then(
            function (response) {
                response.json().then(function (data) {
                    callbackSuccess(data);
                });
            }
        ).catch(function (err) {
            callbackFail(err);
        });
    }

    return {
        getCoordinatesFromNavigator: getCoordinatesFromNavigator,
        getCoordinatesFromLocation: getCoordinatesFromLocation
    };
})();


var DistanceCalcTools = (function () {

    function calculateDistance(pointA, pointB) {
        if (pointA === undefined || pointB === undefined)
            return null;

        return calcCrow(
            pointA.getCoordinates()[0],
            pointA.getCoordinates()[1],
            pointB.getCoordinates()[0],
            pointB.getCoordinates()[1]
        );
    }

    function calculateDistanceCoordinates(lat1, lon1, lat2, lon2) {
        return calcCrow(lat1, lon1, lat2, lon2);
    }

    function calcCrow(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = toRad(lat2 - lat1);
        var dLon = toRad(lon2 - lon1);
        var lat1 = toRad(lat1);
        var lat2 = toRad(lat2);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    function toRad(Value) {
        return Value * Math.PI / 180;
    }

    return {
        calculateDistance: calculateDistance,
        calculateDistanceCoordinates: calculateDistanceCoordinates
    };
})();


var LazyLoadingTools = (function () {

    let scriptsLoaded = [];
    let competitionsCount;
    let onCompetitionScriptsLoadedCallback;

    function loadScript(url) {

        if (scriptsLoaded.indexOf(url) > -1) {
            scriptLoaded();
            return;
        }

        const head = document.getElementsByTagName('head')[0];
        let script = document.createElement("script");
        script.src = url;
        script.onload = scriptLoaded;
        script.onreadystatechange = function () {
            if (this.readyState == 'complete') {
                scriptLoaded();
            }
        };

        head.appendChild(script);
        scriptsLoaded.push(url);
    }

    function scriptLoaded() {
        competitionsCount--;
        if (competitionsCount === 0)
            onCompetitionScriptsLoadedCallback();
    }

    function setCompetitionsCount(count) {
        competitionsCount = count;
    }

    function setOnCompetitionScriptsLoadedCallback(callback) {
        onCompetitionScriptsLoadedCallback = callback;
    }

    return {
        loadScript: loadScript,
        setCompetitionsCount: setCompetitionsCount,
        setOnCompetitionScriptsLoadedCallback: setOnCompetitionScriptsLoadedCallback
    };
})();


var HtmlHelper = (function () {

    const CONST_DEFAULT_LATITUDE = 46.2044;
    const CONST_DEFAULT_LONGITUDE = 6.1432;
    const CONST_DEFAULT_MAXCLUBS = 5;

    let isSearchBoxContentShown = false;
    let currentLatitude, currentLongitude;

    function init(fnRedoSearch, fnGeoLocFromNavigator) {

        setupSearchBox();
        setupGeoLocMeButton(fnGeoLocFromNavigator, fnRedoSearch);

        // if any competition is (de)selected, if the position or the number of clubs shown change, redo the search
        addRedoSearchCallbackOnInputChange(fnRedoSearch);
    };

    function setupSearchBox() {
        const searchBoxTitle = DOMFinder.getSearchBoxTitleDiv();
        searchBoxTitle.onclick = function () {
            switchSearchBoxVisibility(!isSearchBoxContentShown);
        }
    }

    function setupGeoLocMeButton(fnGeoLocFromNavigator, fnRedoSearch) {
        const btnGeoLoc = DOMFinder.getGeoLocMeButton();
        btnGeoLoc.onclick = function () {
            fnGeoLocFromNavigator(
                function (position) {
                    setCurrentCoordinates(position.coords.latitude, position.coords.longitude);
                    fnRedoSearch();
                },
                fnRedoSearch
            );
        };
    }

    function addRedoSearchCallbackOnInputChange(fnRedoSearch) {
        const chksCompetition = DOMFinder.getCompetitionCheckboxes();
        const inputAddress = DOMFinder.getAddressInput();
        const inputMaxClubs = DOMFinder.getMaxClubsInput();

        chksCompetition.map(chk => chk.onchange = fnRedoSearch);
        inputMaxClubs.onchange = fnRedoSearch;
        inputAddress.onchange = fnRedoSearch;
    }

    function switchSearchBoxVisibility(shouldShow) {
        shouldShow = shouldShow || false;
        const searchBoxContentDiv = DOMFinder.getSearchBoxContentDiv();
        shouldShow === true ? searchBoxContentDiv.classList.remove("hidden") : searchBoxContentDiv.classList.add("hidden");
        isSearchBoxContentShown = shouldShow;
    }

    function getMapDivID() {
        return DOMFinder.getMapDiv().id;
    }

    function getNbClubsShown() {
        const inputValueMaxClubs = DOMFinder.getMaxClubsInput().value;
        if (Tools.isInteger(inputValueMaxClubs))
            return parseInt(inputValueMaxClubs, 10);
        else
            return CONST_DEFAULT_MAXCLUBS;
    }

    function getCurrentCoordinates(onCurrentCoordinatesLoaded) {
        const inputValueAddress = DOMFinder.getAddressInput().value;
        if (inputValueAddress.length > 0) {
            return getCurrentCoordinatesFromLocation(inputValueAddress, onCurrentCoordinatesLoaded);
        } else {
            return getCurrentCoordinatesFromGeoPosition(onCurrentCoordinatesLoaded);
        }
    }

    function getCurrentCoordinatesFromGeoPosition(onCurrentCoordinatesLoaded) {
        const latitude = currentLatitude || CONST_DEFAULT_LATITUDE;
        const longitude = currentLongitude || CONST_DEFAULT_LONGITUDE;

        onCurrentCoordinatesLoaded(new Coordinate(
            latitude, longitude, Coordinate.getDefaultDescription()
        ));
    }

    function getCurrentCoordinatesFromLocation(address, onCurrentCoordinatesLoaded) {
        GeoLocTools.getCoordinatesFromLocation(address,
            function (data) {
                getCoordinatesFromLocationSuccess(data, onCurrentCoordinatesLoaded)
            },
            errWhileLookingForCoordinates
        );
    }

    function getCoordinatesFromLocationSuccess(data, onCurrentCoordinatesLoaded) {

        if (data.length == 0)
            errWhileLookingForCoordinates('not found');

        // let's assume the first result is the good one
        const info = data[0];
        setAddressResult(info.address);
        setCurrentCoordinates(info.lat, info.lon);

        onCurrentCoordinatesLoaded(new Coordinate(
            info.lat, info.lon, Coordinate.getDefaultDescription()
        ));
    }

    // TODO
    function errWhileLookingForCoordinates(err) {
        console.err(err);
    }

    function setCurrentCoordinates(latitude, longitude) {
        currentLatitude = latitude;
        currentLongitude = longitude;
    }

    function clearLocationInput() {
        DOMFinder.getAddressInput().value = '';
        DOMFinder.getAddressResultSpan().innerText = '';
    }

    function getSelectedCompetitions() {
        let _competitions = [];
        DOMFinder.getCompetitionCheckboxes().forEach(chkCompetition => {
            if (chkCompetition.checked === true) {
                _competitions.push(getCompetitionByCheckboxID(chkCompetition.id));
            }
        });
        return _competitions;
    }

    function printClubs(clubs) {
        const divTeams = DOMFinder.getTeamsDiv();

        // clear
        DOMFinder.getResultDiv().classList.remove('hidden');
        divTeams.innerHTML = '';

        const maxTeams = getNbClubsShown();
        if (maxTeams !== clubs.length)
            throw new Error('maxTeams !== clubs.length');

        let club;
        let tmpDiv = document.createElement("div");
        for (let index = 1; index <= maxTeams; index++) {
            club = clubs[index - 1];
            tmpDiv.appendChild(getClubCard(index, club));
        }
        divTeams.innerHTML = tmpDiv.innerHTML;
    }

    function setAddressResult(addressInfo) {
        const road = addressInfo.road !== undefined ? `${addressInfo.road}, ` : '';
        const mainLoc = addressInfo.town || addressInfo.city || addressInfo.county || '';
        const infoAddress = `${road}${mainLoc} (${addressInfo.country})`;

        DOMFinder.getAddressResultSpan().innerText = infoAddress;
    }

    // <div class="teamCard" id="team_1">
    //     <div class="teamName" id="team_1_name"></div>
    //     <div class="teamCompetition" id="team_1_competition"></div>
    //     <div class="teamWebsite" id="team_1_website">
    //      <a href="...">...</a>
    //     </div>
    // </div>
    function getClubCard(index, club) {

        let teamCard = document.createElement('div');
        teamCard.className = "teamCard";
        teamCard.id = `team_${index}`;

        let teamCrest = document.createElement('div');
        teamCrest.className = "teamCrest";
        let teamInfo = document.createElement('div');
        teamInfo.className = "teamInfo";

        let teamCrestImage = document.createElement('img');
        teamCrestImage.src = club.crestURL;
        teamCrestImage.className = "teamCrest";

        let teamName = document.createElement('div');
        teamName.className = "teamName";
        teamName.id = `team_${index}_name`;
        teamName.innerText = club.name;

        let teamCompetition = document.createElement('div');
        teamCompetition.className = "teamCompetition";
        teamCompetition.id = `team_${index}_competition`;
        teamCompetition.innerText = club.competition;

        let teamWebsite = document.createElement('div');
        teamWebsite.className = "teamWebsite";
        teamWebsite.id = `team_${index}_website`;
        let teamWebsiteLink = document.createElement('a');
        teamWebsiteLink.href = club.website;
        teamWebsiteLink.text = club.website;
        teamWebsite.appendChild(teamWebsiteLink);

        teamCrest.appendChild(teamCrestImage);
        teamInfo.appendChild(teamName);
        teamInfo.appendChild(teamCompetition);
        teamInfo.appendChild(teamWebsite);
        teamCard.appendChild(teamCrest);
        teamCard.appendChild(teamInfo);

        return teamCard;
    }

    return {
        init: init,
        getMapDivID: getMapDivID,
        getCurrentCoordinates: getCurrentCoordinates,
        setCurrentCoordinates: setCurrentCoordinates,
        getSelectedCompetitions: getSelectedCompetitions,
        getNbClubsShown: getNbClubsShown,
        printClubs: printClubs,
        clearLocationInput: clearLocationInput,
        closeSearchBox: switchSearchBoxVisibility
    };
})();



const DOMFinder = (function () {

    function getMapDiv() {
        return document.getElementById("mapid");
    }

    function getSearchBoxContentDiv() {
        return document.getElementById("searchBoxContent");
    }

    function getAddressInput() {
        return document.getElementById("inputAddress");
    }

    function getMaxClubsInput() {
        return document.getElementById("nbShownClubs");
    }

    function getAddressResultSpan() {
        return document.getElementById("addressResult");
    }

    function getSearchBoxTitleDiv() {
        return document.getElementById("searchBoxTitle");
    }

    function getGeoLocMeButton() {
        return document.getElementById("btnGeoLoc");
    }

    function getTeamsDiv() {
        return document.getElementById("teams");
    }

    function getResultDiv() {
        return document.getElementById("divResult");
    }

    function getCompetitionCheckboxes() {
        return [
            document.getElementById("chk_france_ligue1"),
            document.getElementById("chk_spain_primeraDivision"),
            document.getElementById("chk_germany_bundesliga"),
            document.getElementById("chk_gb_premierLeague"),
            document.getElementById("chk_italy_serieA")
        ];
    }

    return {
        getSearchBoxContentDiv: getSearchBoxContentDiv,
        getAddressInput: getAddressInput,
        getMaxClubsInput: getMaxClubsInput,
        getAddressResultSpan: getAddressResultSpan,
        getSearchBoxTitleDiv: getSearchBoxTitleDiv,
        getGeoLocMeButton: getGeoLocMeButton,
        getTeamsDiv: getTeamsDiv,
        getResultDiv: getResultDiv,
        getMapDiv: getMapDiv,
        getCompetitionCheckboxes: getCompetitionCheckboxes
    }
})();