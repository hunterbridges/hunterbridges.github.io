var programs = {
    1: "Acoustic Grand Piano",
    2: "Bright Acoustic Piano",
    3: "Electric Grand Piano",
    4: "Honky-tonk Piano",
    5: "Electric Piano 1",
    6: "Electric Piano 2",
    7: "Harpsichord",
    8: "Clavi",

    9: "Celesta",
    10: "Glockenspiel",
    11: "Music Box",
    12: "Vibraphone",
    13: "Marimba",
    14: "Xylophone",
    15: "Tubular Bells",
    16: "Dulcimer",

    17: "Drawbar Organ",
    18: "Percussive Organ",
    19: "Rock Organ",
    20: "Church Organ",
    21: "Reed Organ",
    22: "Accordion",
    23: "Harmonica",
    24: "Tango Accordion",

    25: "Acoustic Guitar (nylon)",
    26: "Acoustic Guitar (steel)",
    27: "Electric Guitar (jazz)",
    28: "Electric Guitar (clean)",
    29: "Electric Guitar (muted)",
    30: "Overdriven Guitar",
    31: "Distortion Guitar",
    32: "Guitar Harmonics",

    33: "Acoustic Bass",
    34: "Electric Bass (finger)",
    35: "Electric Bass (pick)",
    36: "Fretless Bass",
    37: "Slap Bass 1",
    38: "Slap Bass 2",
    39: "Synth Bass 1",
    40: "Synth Bass 2",

    41: "Violin",
    42: "Viola",
    43: "Cello",
    44: "Contrabass",
    45: "Tremolo Strings",
    46: "Pizzicato Strings",
    47: "Orchestral Harp",
    48: "Timpani",

    49: "String Ensemble 1",
    50: "String Ensemble 2",
    51: "Synth Strings 1",
    52: "Synth Strings 2",
    53: "Choir Aahs",
    54: "Voice Oohs",
    55: "Synth Voice",
    56: "Orchestra Hit",

    57: "Trumpet",
    58: "Trombone",
    59: "Tuba",
    60: "Muted Trumpet",
    61: "French Horn",
    62: "Brass Section",
    63: "Synth Brass 1",
    64: "Synth Brass 2",

    65: "Soprano Sax",
    66: "Alto Sax",
    67: "Tenor Sax",
    68: "Baritone Sax",
    69: "Oboe",
    70: "English Horn",
    71: "Bassoon",
    72: "Clarinet",

    73: "Piccolo",
    74: "Flute",
    75: "Recorder",
    76: "Pan Flute",
    77: "Blown bottle",
    78: "Shakuhachi",
    79: "Whistle",
    80: "Ocarina",

    81: "Lead 1 (square)",
    82: "Lead 2 (sawtooth)",
    83: "Lead 3 (calliope)",
    84: "Lead 4 (chiff)",
    85: "Lead 5 (charang)",
    86: "Lead 6 (voice)",
    87: "Lead 7 (fifths)",
    88: "Lead 8 (bass + lead)",

    89: "Pad 1 (new age)",
    90: "Pad 2 (warm)",
    91: "Pad 3 (polysynth)",
    92: "Pad 4 (choir)",
    93: "Pad 5 (bowed)",
    94: "Pad 6 (metallic)",
    95: "Pad 7 (halo)",
    96: "Pad 8 (sweep)",

    97: "FX 1 (rain)",
    98: "FX 2 (soundtrack)",
    99: "FX 3 (crystal)",
    100: "FX 4 (atmosphere)",
    101: "FX 5 (brightness)",
    102: "FX 6 (goblins)",
    103: "FX 7 (echoes)",
    104: "FX 8 (sci-fi)",

    105: "Sitar",
    106: "Banjo",
    107: "Shamisen",
    108: "Koto",
    109: "Kalimba",
    110: "Bag pipe",
    111: "Fiddle",
    112: "Shanai",

    113: "Tinkle Bell",
    114: "Agogo",
    115: "Steel Drums",
    116: "Woodblock",
    117: "Taiko Drum",
    118: "Melodic Tom",
    119: "Synth Drum",
    120: "Reverse Cymbal",

    121: "Guitar Fret Noise",
    122: "Breath Noise",
    123: "Seashore",
    124: "Bird Tweet",
    125: "Telephone Ring",
    126: "Helicopter",
    127: "Applause",
    128: "Gunshot"
};

var drumPrograms = {
    1: "Standard Kit",
    9: "Room Kit",
    17: "Power Kit",
    25: "Electronic Kit",
    26: "TR-808 Kit",
    33: "Jazz Kit",
    41: "Brush Kit",
    49: "Orchestra Kit",
    57: "Sound FX Kit",
    128: "CM-64/CM-32L"
};

var anchorRegex = /#([A-Za-z0-9_,]*)$/;

document.addEventListener("DOMContentLoaded", function() {
    var rollButton = document.getElementById("roll");
    var dlLink = document.getElementById("dl-link");
    var dlButton = document.getElementById("download");

    var progNumberCells = document.getElementsByClassName("program-number");
    var progNameCells = document.getElementsByClassName("program-name");

    var timers = new Array(16);
    var selections = new Array(16);
    var started = false;
    var finished = false;
    var interval = null;

    var progKeys = Object.keys(programs);
    var drumProgKeys = Object.keys(drumPrograms);

    var blobURL = null;

    function generateFile(selections) {
        var bin = new BinString();
        bin.bigEndian = true;

        // MIDI Header
        bin.WriteString("MThd", false);
        bin.WriteInt32(6); // chunklen
        bin.WriteInt16(1); // format
        bin.WriteInt16(17); // num tracks (tempo + inst tracks)
        bin.WriteInt16(960); // Metric timing, 960 ppqn

        {
            // Tempo Track Chunk
            bin.WriteString("MTrk", false);

            // Chunk length
            var chunkLen = 15;
            bin.WriteInt32(chunkLen);

            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xFF); // Tempo meta event
            bin.WriteByte(0x51);
            bin.WriteByte(0x03);
            bin.WriteInt24(500000); // Tempo (120 bpm)

            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xFF); // Time sig meta event
            bin.WriteByte(0x58);
            bin.WriteByte(0x04); // 4/4 time
            bin.WriteByte(0x04);
            bin.WriteByte(0x02); // click every quarter note
            bin.WriteByte(0x18);
            bin.WriteByte(0x08);
        }

        // Instrument Track Chunks
        for (var i = 0; i < 16; i++)
        {
            var progList = (i == 9 ? drumPrograms : programs);
            var progNum = selections[i];
            var progName = progList[progNum];

            bin.WriteString("MTrk", false);

            // Chunk length
            chunkLen  = (4 + progName.length) + (3) + (4 * 7);
            bin.WriteInt32(chunkLen);

            // Track name
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xFF); // Track name meta event
            bin.WriteByte(0x03);
            bin.WriteByte(progName.length);
            bin.WriteString(progName, false);

            // bank 0
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xB0 + i); // Controller change
            bin.WriteByte(0); // bank change
            bin.WriteByte(0);

            // Track program
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xC0 + i); // Program change
            bin.WriteByte(progNum - 1);

            // 0 mod
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xB0 + i); // Controller change
            bin.WriteByte(1); // Modulation
            bin.WriteByte(0);

            // 100 vol
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xB0 + i); // Controller change
            bin.WriteByte(7); // Volume
            bin.WriteByte(100);

            // Center pan 
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xB0 + i); // Controller change
            bin.WriteByte(10); // Pan
            bin.WriteByte(64);

            // 100 exp 
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xB0 + i); // Controller change
            bin.WriteByte(11); // Expression
            bin.WriteByte(100);

            // 0 sustain pedal
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xB0 + i); // Controller change
            bin.WriteByte(64); // sustain pedal
            bin.WriteByte(0);

            // Center pitch bend
            bin.WriteByte(0x00); // 0 delta time
            bin.WriteByte(0xE0 + i); // Pitch bend
            bin.WriteByte(0x00); 
            bin.WriteByte(0x40);
        }

        var u8 = new Uint8Array(bin.bytes);
        var blobConfig = new Blob([u8], { type: 'audio/midi' });

        // Convert Blob to URL
        blobURL = window.URL.createObjectURL(blobConfig);
        dlLink.setAttribute("href", blobURL);
    }

    function rollStep(e) {
        var live = false;

        for (var i = 0; i < 16; i++)
        {
            if (timers[i] <= 0) continue;

            live = true;

            // Decrement the timer
            timers[i] -= 50;

            // Pick the list based on whether it's the drum channel or not
            var progList = (i == 9 ? drumPrograms : programs);
            var keys = (i == 9 ? drumProgKeys : progKeys);

            var randIndex = 0;
            var progNumber = 0;
            if (timers[i] === 0 && i > 0 && i != 9)
            {
                // If timer is 0, make sure the patch is unique
                var unique = false;
                while (unique === false)
                {
                    randIndex = Math.round(Math.random() * keys.length);
                    progNumber = keys[randIndex];

                    unique = true;
                    for (var j = 0; j < i; j++)
                    {
                        if (j == 9)
                            continue;

                        if (progNumber !== selections[j])
                            continue;
                        
                        unique = false;
                        break;
                    }
                }
            }
            else
            {
                randIndex = Math.round(Math.random() * keys.length);
                progNumber = keys[randIndex];
            }

            progNumberCells[i].textContent = progNumber;
            progNameCells[i].textContent = progList[progNumber];
            selections[i] = progNumber;
        }

        if (live === false)
        {
            clearInterval(interval);
            finished = true;
            rollButton.removeAttribute("disabled");
            dlButton.removeAttribute("disabled");

            generateFile(selections);

            // Set the anchor so these settings can be recalled/linked to
            window.location = (""+window.location).replace(anchorRegex,'') + "#" + selections.join(",");
        }
    }

    function startRoll(e) {
        if (started == true && finished == false) return;

        started = true;
        finished = false;

        if (blobURL)
        {
            window.URL.revokeObjectURL(blobURL);
            blobURL = null;

            dlLink.setAttribute("href", "");
        }

        for (var i = 0; i < 16; i++)
        {
            timers[i] = 1000 + (i * 150);
        }

        rollButton.setAttribute("disabled", "true");
        dlButton.setAttribute("disabled", "true");

        interval = setInterval(rollStep, 50);
    };

    function doDownload(e) {
        if (finished == false) return false;
        if (!blobURL) return false;

        return true;
    };

    // Recall anchor if needed
    var locStr = (""+window.location);
    var matches = null;
    if (matches = locStr.match(anchorRegex))
    {
        var channels = matches[1].split(",");

        for (var i = 0; i < 16; i++)
        {
            // Pick the list based on whether it's the drum channel or not
            var progList = (i == 9 ? drumPrograms : programs);

            var progNumber = 0;
            if (i >= channels.length)
                progNumber = 1;
            else
                progNumber = parseInt(channels[i], 10);

            progNumberCells[i].textContent = progNumber;
            progNameCells[i].textContent = progList[progNumber];
            selections[i] = progNumber;
        }

        started = true;
        finished = true;

        generateFile(selections);
    }

    rollButton.addEventListener("click", startRoll);
    dlLink.addEventListener("click", doDownload);
    dlButton.addEventListener("click", doDownload);

    if (finished == false)
        dlButton.setAttribute("disabled", "true");
});