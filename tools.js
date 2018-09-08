var Tools = (function () {

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

    function setCompetitionsCount(count)
    {
        competitionsCount = count;
    }

    function setOnCompetitionScriptsLoadedCallback(callback)
    {
        onCompetitionScriptsLoadedCallback = callback;
    }

    return {
        loadScript: loadScript,
        setCompetitionsCount: setCompetitionsCount,
        setOnCompetitionScriptsLoadedCallback: setOnCompetitionScriptsLoadedCallback
    };
})();


var HtmlHelper = (function () {

    // coordinates
    const inputLatitude = document.getElementById("inputLatitude");
    const inputLongitude = document.getElementById("inputLongitude");

    // competitions
    const chk_France_ligue1 = document.getElementById("chk_france_ligue1");
    const chk_Spain_primeraDivision = document.getElementById("chk_spain_primeraDivision");

    // submit button
    const btnSubmitCoordinates = document.getElementById("btnSubmitCoordinates");

    // "result"
    const divTeams = document.getElementById("teams");


    function init(callbackOnSubmit) {
        btnSubmitCoordinates.onclick = callbackOnSubmit;
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

    function getSelectedCompetitions() {
        let _competitions = [];

        if (chk_France_ligue1.checked === true) {
            _competitions.push(Competitions.France_Ligue1);
        }

        if (chk_Spain_primeraDivision.checked === true) {
            _competitions.push(Competitions.Spain_PrimeraDivision);
        }

        return _competitions;
    }

    function printClubs(clubs) {
        let result = '';
        for (let club of clubs) {
            result += `<b>${club.name}</b><br/>`;
        }
        divTeams.innerHTML = result;
    }

    return {
        init: init,
        getMapDivID: getMapDivID,
        getCurrentCoordinates: getCurrentCoordinates,
        getSelectedCompetitions: getSelectedCompetitions,
        printClubs: printClubs
    };

})();