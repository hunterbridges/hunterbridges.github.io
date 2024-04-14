document.addEventListener("DOMContentLoaded", function() {
    var rollButton = document.getElementById("roll");

    var systemNameCells = document.getElementsByClassName("system-name");
    var gameTitleCells = document.getElementsByClassName("game-title");

    var timers = new Array(5);
    var systems = new Array(5);
    var titles = new Array(5);
    var started = false;
    var finished = false;
    var interval = null;

    var systemKeys = Object.keys(randomizerData);

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
                    randIndex = Math.round(Math.random() * (systemKeys.length - 1));
                    systemName = systemKeys[randIndex];

                    unique = true;
                    for (var j = 0; j < i; j++)
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
                    randIndex = Math.round(Math.random() * (gameList.length - 1));
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
                randIndex = Math.round(Math.random() * (systemKeys.length - 1));
                systemName = systemKeys[randIndex];

                var gameList = randomizerData[systemName];
                randIndex = Math.round(Math.random() * (gameList.length - 1));
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

        started = true;
        finished = false;

        for (var i = 0; i < 16; i++)
        {
            timers[i] = 1000 + (i * 150);
        }

        rollButton.setAttribute("disabled", "true");

        interval = setInterval(rollStep, 50);
    };

    rollButton.addEventListener("click", startRoll);
});