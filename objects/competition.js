// TODO: fix!

const Competitions = {
    France_Ligue1: {
        jsData: 'data/france_ligue1.js',
        checkboxID: 'chk_france_ligue1'
    },
    Spain_PrimeraDivision: {
        jsData: 'data/spain_primeraDivision.js',
        checkboxID: 'chk_spain_primeraDivision'
    },
    Germany_Bundesliga: {
        jsData: 'data/germany_bundesliga.js',
        checkboxID: 'chk_germany_bundesliga'
    },
    England_PremierLeague: {
        jsData: 'data/england_premierLeague.js',
        checkboxID: 'chk_gb_premierLeague'
    },
    Italy_SerieA: {
        jsData: 'data/italy_serieA.js',
        checkboxID: 'chk_italy_serieA'
    },
};

function getCompetitionByCheckboxID(chkID) {
    for (let competitionName in Competitions) {
        if (Competitions[competitionName].checkboxID == chkID)
            return Competitions[competitionName];
    }
}