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

    let _maxTeams = 0;

    // coordinates
    const inputLatitude = document.getElementById("inputLatitude");
    const inputLongitude = document.getElementById("inputLongitude");
    const btnGeoLoc = document.getElementById("btnGeoLoc");

    // competitions
    const chk_France_ligue1 = document.getElementById("chk_france_ligue1");
    const chk_Spain_primeraDivision = document.getElementById("chk_spain_primeraDivision");
    const chk_Germany_bundesliga = document.getElementById("chk_germany_bundesliga");
    const chk_England_premierLeague = document.getElementById("chk_gb_premierLeague");


    function init(callbackOnSubmit, callbackGeoLoc, maxTeams) {
        
        _maxTeams = maxTeams;

        // form fields
        inputLatitude.onchange = callbackOnSubmit;
        inputLongitude.onchange = callbackOnSubmit;
        chk_France_ligue1.onchange = callbackOnSubmit;
        chk_Spain_primeraDivision.onchange = callbackOnSubmit;
        chk_Germany_bundesliga.onchange = callbackOnSubmit;
        chk_England_premierLeague.onchange = callbackOnSubmit;

        // geoloc button
        btnGeoLoc.onclick = function() {
            callbackGeoLoc(
                function(position) { 
                    setCurrentCoordinates(position.coords.latitude, position.coords.longitude);
                    callbackOnSubmit();
                },
                callbackOnSubmit
            );
        };
    };

    function getMapDivID() {
        return 'mapid';
    }

    function getCurrentCoordinates() {
        return new Coordinate(
            inputLatitude.value,
            inputLongitude.value,
            Coordinate.getDefaultDescription()
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

        return _competitions;
    }

    function printClubs(clubs) {
        if (_maxTeams !== clubs.length)
            throw new Error('maxTeams !== clubs.length');

        let divClubName, divClubCompetition, divClubWebsite, club;
        for (let i = 1; i <= _maxTeams; i++) {
            divClubName = document.getElementById(`team_${i}_name`);
            divClubCompetition = document.getElementById(`team_${i}_competition`);
            divClubWebsite = document.getElementById(`team_${i}_website`);

            club = clubs[i - 1];
            divClubName.innerText = club.name;
            divClubCompetition.innerText = club.competition;
            divClubWebsite.innerHTML = `<a href="${club.website}">${club.website}</a>`;
        }
    }

    return {
        init: init,
        getMapDivID: getMapDivID,
        getCurrentCoordinates: getCurrentCoordinates,
        setCurrentCoordinates: setCurrentCoordinates,
        getSelectedCompetitions: getSelectedCompetitions,
        printClubs: printClubs
    };

})();