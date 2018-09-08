var App = (function () {

    const maxTeams = 5;

    const tryToGeoLocAtInit = false;


    // meh
    let _competitions = [];

    function init() {
        HtmlHelper.init(onFormSubmit, Tools.tryToGeoLoc, maxTeams);
        MapHelper.init(HtmlHelper.getMapDivID());
        
        if (tryToGeoLocAtInit === true)
        {
            Tools.tryToGeoLoc(showPosition, onFormSubmit);
        }
        else {
            onFormSubmit();
        }
    }

    function showPosition(position) {
        HtmlHelper.setCurrentCoordinates(position.coords.latitude, position.coords.longitude);
        onFormSubmit();
    }

    function onFormSubmit() {
        // remove all markers on the map
        MapHelper.cleanMarkers();

        // get selected competitions form the form
        _competitions = HtmlHelper.getSelectedCompetitions();

        LazyLoadingTools.setCompetitionsCount(_competitions.length);
        LazyLoadingTools.setOnCompetitionScriptsLoadedCallback(onCompetitionScriptLoaded);

        // load competitions scripts
        for (let competition of _competitions) {
            LazyLoadingTools.loadScript(competition);
        }
    }

    function onCompetitionScriptLoaded() {

        const clubs = getClubs();

        // coordinates to look for
        const currentCoordinates = HtmlHelper.getCurrentCoordinates();
        MapHelper.addMarker(currentCoordinates, true);

        // get the X closest clubs
        const closestClubs = findClosestClubFromCoordinates(clubs, currentCoordinates);

        // add the markers and print the results
        MapHelper.addMarkers(closestClubs.map(x => x.coordinates), false);
        HtmlHelper.printClubs(closestClubs);
    }

    function getClubs() {

        if (_competitions.length === 0)
            throw new Error("competitions.length === 0");

        let teams = [];
        _competitions.forEach(competition => {

            switch (competition) {
                case Competitions.France_Ligue1:
                    teams = teams.concat(competitions_france_ligue1.teams);
                    break;
                case Competitions.Spain_PrimeraDivision:
                    teams = teams.concat(competitions_spain_primeraDivision.teams);
                    break;
            }
        });

        let clubs = [];
        teams.forEach(function (team) {
            clubs.push(
                new Club(
                    team.name,
                    new Coordinate(team.latitude, team.longitude, team.name),
                    '', // competition
                    team.website
                )
            );
        });

        return clubs;
    }

    function findClosestClubFromCoordinates(clubs, coordinates) {
        return clubs.sort(function (clubA, clubB) {
            const distanceClubA = DistanceTools.calculateDistance(clubA.coordinates, coordinates);
            const distanceClubB = DistanceTools.calculateDistance(clubB.coordinates, coordinates);
            return distanceClubA - distanceClubB;
        }).slice(0, maxTeams);
    }

    return {
        init: init
    };
})();

App.init();