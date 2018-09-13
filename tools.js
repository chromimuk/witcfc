var Tools = (function () {

    function tryToGeoLoc(callbackSuccess, callbackFail) {

        console.log(callbackSuccess, callbackFail);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(callbackSuccess, callbackFail);
        } else {
            callbackFail();
        }
    }

    return {
        tryToGeoLoc: tryToGeoLoc
    }
})();



var DistanceTools = (function () {
    function calculateDistance(pointA, pointB) {
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

    const default_latitude = 46.2044;
    const default_longitude = 6.1432;
    const default_maxClubsShown = 5;

    let isSearchBoxContentShown = false;

    // form
    const searchBoxTitle = document.getElementById("searchBoxTitle");
    const searchBoxContent = document.getElementById("searchBoxContent");
    const inputLatitude = document.getElementById("inputLatitude");
    const inputLongitude = document.getElementById("inputLongitude");
    const btnGeoLoc = document.getElementById("btnGeoLoc");

    // competitions
    const chk_France_ligue1 = document.getElementById("chk_france_ligue1");
    const chk_Spain_primeraDivision = document.getElementById("chk_spain_primeraDivision");
    const chk_Germany_bundesliga = document.getElementById("chk_germany_bundesliga");
    const chk_England_premierLeague = document.getElementById("chk_gb_premierLeague");
    const chk_Italy_SerieA = document.getElementById("chk_italy_serieA");

    // nbShownClubs
    const inputNbShownClubs = document.getElementById("nbShownClubs");

    // results
    const divTeams = document.getElementById("teams");



    function init(callbackOnSubmit, callbackGeoLoc) {

        // form fields
        inputLatitude.onchange = callbackOnSubmit;
        inputLongitude.onchange = callbackOnSubmit;
        chk_France_ligue1.onchange = callbackOnSubmit;
        chk_Spain_primeraDivision.onchange = callbackOnSubmit;
        chk_Germany_bundesliga.onchange = callbackOnSubmit;
        chk_England_premierLeague.onchange = callbackOnSubmit;
        chk_Italy_SerieA.onchange = callbackOnSubmit;
        inputNbShownClubs.onchange = callbackOnSubmit;

        // geoloc button
        btnGeoLoc.onclick = function () {
            callbackGeoLoc(
                function (position) {
                    setCurrentCoordinates(position.coords.latitude, position.coords.longitude);
                    callbackOnSubmit();
                },
                callbackOnSubmit
            );
        };

        searchBoxTitle.onclick = function () {
            console.log('searchBoxTitle')
            if (isSearchBoxContentShown === true)
                searchBoxContent.classList.add("hidden");
            else
                searchBoxContent.classList.remove("hidden");

            isSearchBoxContentShown = !isSearchBoxContentShown;
            console.log(searchBoxContent)
        }
    };

    function getMapDivID() {
        return 'mapid';
    }

    function getNbClubsShown() {
        const inputNbShownClubsValue = inputNbShownClubs.value;
        const isInt = /^-?[0-9]+$/;
        if (isInt.test(inputNbShownClubsValue))
            return parseInt(inputNbShownClubsValue, 10);
        else
            return default_maxClubsShown;
    }

    function getCurrentCoordinates() {
        let latitude = inputLatitude.value || default_latitude;
        let longitude = inputLongitude.value || default_longitude;
        return new Coordinate(
            latitude, longitude, Coordinate.getDefaultDescription()
        );
    }

    function setCurrentCoordinates(latitude, longitude) {
        inputLatitude.value = latitude;
        inputLongitude.value = longitude;
    }

    function getSelectedCompetitions() {
        let _competitions = [];

        if (chk_France_ligue1.checked === true) {
            _competitions.push(Competitions.France_Ligue1);
        }

        if (chk_Spain_primeraDivision.checked === true) {
            _competitions.push(Competitions.Spain_PrimeraDivision);
        }

        if (chk_Germany_bundesliga.checked === true) {
            _competitions.push(Competitions.Germany_Bundesliga);
        }

        if (chk_England_premierLeague.checked === true) {
            _competitions.push(Competitions.England_PremierLeague);
        }

        if (chk_Italy_SerieA.checked === true) {
            _competitions.push(Competitions.Italy_SerieA);
        }

        return _competitions;
    }

    function printClubs(clubs) {
        const maxTeams = getNbClubsShown();
        if (maxTeams !== clubs.length)
            throw new Error('maxTeams !== clubs.length');

        divTeams.innerHTML = '';

        let club;
        for (let index = 1; index <= maxTeams; index++) {
            club = clubs[index - 1];
            divTeams.appendChild(getClubCard(index, club));
        }
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
        printClubs: printClubs
    };

})();