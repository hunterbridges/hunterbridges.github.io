document.addEventListener("DOMContentLoaded", function() {
    var rng = new RNG(Date.now().toString());
    var rollButton = document.getElementById("roll");

    var systemNameCells = document.getElementsByClassName("system-name");
    var gameTitleCells = document.getElementsByClassName("game-title");

    var selectAllSysButton = document.getElementById("sys_select_all");
    var selectNoneSysButton = document.getElementById("sys_select_none");

    var timers = new Array(5);
    var systems = new Array(5);
    var titles = new Array(5);
    var useSystems = [];
    var started = false;
    var finished = false;
    var interval = null;

    function getRandomIndex(listLength)
    {
        var randIndex = rng.random(0, listLength);
        return randIndex;
    }

    function rollStep(e) {
        var live = false;

        for (var i = 0; i < 5; i++)
        {
            if (timers[i] <= 0) continue;

            live = true;

            // Decrement the timer
            timers[i] -= 50;

            var randIndex = 0;
            var systemName = null;
            var gameTitle = null;
            if (timers[i] === 0 && i > 0 && i != 9)
            {
                // If timer is 0, make sure the system is unique
                var unique = false;
                while (unique === false)
                {
                    randIndex = getRandomIndex(useSystems.length);
                    systemName = useSystems[randIndex];

                    unique = true;
                    for (var j = 0; j < i && useSystems.length >= 5; j++)
                    {
                        if (systemName !== systems[j])
                            continue;
                        
                        unique = false;
                        break;
                    }
                }

                // Now make sure the game is unique
                var gameList = randomizerData[systemName];
                unique = false;
                while (unique === false)
                {
                    randIndex = getRandomIndex(gameList.length);
                    gameTitle = gameList[randIndex];

                    unique = true;
                    for (var j = 0; j < i; j++)
                    {
                        if (gameTitle !== titles[j])
                            continue;
                        
                        unique = false;
                        break;
                    }
                }
            }
            else
            {
                randIndex = getRandomIndex(useSystems.length);
                systemName = useSystems[randIndex];

                var gameList = randomizerData[systemName];
                randIndex = getRandomIndex(gameList.length);
                gameTitle = gameList[randIndex];
            }

            systemNameCells[i].textContent = systemName;
            gameTitleCells[i].textContent = gameTitle;
            systems[i] = systemName;
            titles[i] = gameTitle;
        }

        if (live === false)
        {
            clearInterval(interval);
            finished = true;
            rollButton.removeAttribute("disabled");
        }
    }

    function startRoll(e) {
        if (started == true && finished == false) return;

        rng = new RNG(Date.now().toString());

        started = true;
        finished = false;

        useSystems = [];

        // Build array of systems ot use
        var query = document.getElementsByClassName("system_check");
        for (let i = 0; i < query.length; i++)
        {
            if (query[i].checked)
                useSystems.push(query[i].getAttribute("name"));
        }

        if (useSystems.length == 0)
            for (let i = 0; i < query.length; i++)
                useSystems.push(query[i].getAttribute("name"));

        for (var i = 0; i < 16; i++)
        {
            timers[i] = 1000 + (i * 150);
        }

        rollButton.setAttribute("disabled", "true");

        interval = setInterval(rollStep, 50);
    };

    rollButton.addEventListener("click", startRoll);

    selectAllSysButton.addEventListener("click", function(e) {
        var query = document.getElementsByClassName("system_check");
        for (let i = 0; i < query.length; i++)
            query[i].checked = true;
    });

    selectNoneSysButton.addEventListener("click", function(e) {
        var query = document.getElementsByClassName("system_check");
        for (let i = 0; i < query.length; i++)
            query[i].checked = false;
    });
});