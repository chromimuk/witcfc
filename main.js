var App = (function () {

    const tryToGeoLocAtInit = true;
    let _maxTeams = 0;
    let _competitions = [];

    function init() {
        HtmlHelper.init(onFormSubmit, GeoLocTools.getCoordinatesFromNavigator);
        MapHelper.init(HtmlHelper.getMapDivID());
        MapHelper.setView();

        onFormSubmit();
        if (tryToGeoLocAtInit === true) {
            GeoLocTools.getCoordinatesFromNavigator(showPosition, onFormSubmit);
        }
    }

    function showPosition(position) {
        HtmlHelper.setCurrentCoordinates(position.coords.latitude, position.coords.longitude);
        onFormSubmit();
    }

    function onFormSubmit() {

        HtmlHelper.closeSearchBox();

        // remove all markers on the map
        MapHelper.cleanMarkers();

        // get selected competitions from the form
        _competitions = HtmlHelper.getSelectedCompetitions();
        _maxTeams = HtmlHelper.getNbClubsShown();

        LazyLoadingTools.setCompetitionsCount(_competitions.length);
        LazyLoadingTools.setOnCompetitionScriptsLoadedCallback(onCompetitionScriptLoaded);

        // load competitions scripts
        for (let competition of _competitions) {
            LazyLoadingTools.loadScript(competition);
        }
    }

    function onCompetitionScriptLoaded() {
        HtmlHelper.getCurrentCoordinates(onCurrentCoordinatesLoaded);
    }

    function onCurrentCoordinatesLoaded(currentCoordinates) {
        // add marker for current coordinates
        MapHelper.addMarker(currentCoordinates, true);

        MapHelper.setView(currentCoordinates._latitude.value, currentCoordinates._longitude.value, 6);

        // get all the clubs
        const clubs = getClubs();

        // get the X closest clubs
        const closestClubs = findClosestClubFromCoordinates(clubs, currentCoordinates);

        // add the markers for the clubs and print the results
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
                    teams = teams.concat(competitions_france_ligue1);
                    break;
                case Competitions.Spain_PrimeraDivision:
                    teams = teams.concat(competitions_spain_primeraDivision);
                    break;
                case Competitions.Germany_Bundesliga:
                    teams = teams.concat(competitions_germany_bundesliga);
                    break;
                case Competitions.England_PremierLeague:
                    teams = teams.concat(competitions_england_premierLeague);
                    break;
                case Competitions.Italy_SerieA:
                    teams = teams.concat(competitions_italy_serieA);
                    break;
            }
        });

        let clubs = [];
        teams.forEach(function (team) {
            clubs.push(
                new Club(
                    team.name,
                    new Coordinate(team.latitude, team.longitude, team.name),
                    team.competition,
                    team.website,
                    team.crestUrl
                )
            );
        });

        return clubs;
    }

    function findClosestClubFromCoordinates(clubs, coordinates) {
        return clubs.sort(function (clubA, clubB) {
            const distanceClubA = DistanceCalcTools.calculateDistance(clubA.coordinates, coordinates);
            const distanceClubB = DistanceCalcTools.calculateDistance(clubB.coordinates, coordinates);
            return distanceClubA - distanceClubB;
        }).slice(0, _maxTeams);
    }

    return {
        init: init
    };
})();

App.init();