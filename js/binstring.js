// -----------------
// Binary writer lib
// by Hunter Bridges
// -----------------

function BinString() {
    this.contents = "";
    this.bytes = new Array();
    this.bigEndian = false;
    this.enc = new TextEncoder();
}

BinString.prototype.Pad = function (num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

BinString.prototype.WriteByte = function (num) {
    var hex = (0xFF & num).toString(16);
    var padded = this.Pad(hex, 2);
    var b = eval('"\\x' + padded + '"');
    this.contents += b;

    this.bytes.push(num);

    return this.contents;
};

BinString.prototype.WriteInt8 = function (num) {
    this.WriteByte(num);
    return this.contents;
};

BinString.prototype.WriteInt16 = function (num) {
    var bytes = null;

    if (this.bigEndian)
    {
        bytes = [
            (num & 0xFF00) >> 8,
            (num & 0xFF)
        ];
    }
    else
    {
        bytes = [
            (num & 0xFF),
            (num & 0xFF00) >> 8
        ];
    }

    this.WriteByte(bytes[0]);
    this.WriteByte(bytes[1]);
    return this.contents;
};

BinString.prototype.WriteInt24 = function (num) {
    var bytes = null;

    if (this.bigEndian)
    {
        bytes = [
            (num & 0xFF0000) >> 16,
            (num & 0xFF00) >> 8,
            (num & 0xFF)
        ];
    }
    else
    {
        bytes = [
            (num & 0xFF),
            (num & 0xFF00) >> 8,
            (num & 0xFF0000) >> 16
        ];
    }

    this.WriteByte(bytes[0]);
    this.WriteByte(bytes[1]);
    this.WriteByte(bytes[2]);
    return this.contents;
};

BinString.prototype.WriteInt32 = function (num) {
    var bytes = null;

    if (this.bigEndian)
    {
        bytes = [
            (num & 0xFF000000) >> 24,
            (num & 0xFF0000) >> 16,
            (num & 0xFF00) >> 8,
            (num & 0xFF)
        ];
    }
    else
    {
        bytes = [
            (num & 0xFF),
            (num & 0xFF00) >> 8,
            (num & 0xFF0000) >> 16,
            (num & 0xFF000000) >> 24
        ];
    }

    this.WriteByte(bytes[0]);
    this.WriteByte(bytes[1]);
    this.WriteByte(bytes[2]);
    this.WriteByte(bytes[3]);
    return this.contents;
};

BinString.prototype.WriteString = function (str, nullterminate = true) {
    this.contents += str;

    var u8Str = this.enc.encode(str);
    Array.prototype.push.apply(this.bytes, u8Str);
    
    if (nullterminate)
    {
        this.contents += "\x00";
        this.bytes.push(0x00);
    }

    return this.contents;
};

// Based on code from Jonas Raoni Soares Silva
// http://jsfromhell.com/classes/binary-parser
BinString.prototype.EncodeFloat = function (number) {
    var n = +number,
    status = (n !== n) || n == -Infinity || n == +Infinity ? n : 0,
    exp = 0,
    len = 281, // 2 * 127 + 1 + 23 + 3,
    bin = new Array(len),
    signal = (n = status !== 0 ? 0 : n) < 0,
    n = Math.abs(n),
    intPart = Math.floor(n),
    floatPart = n - intPart,
    i, lastBit, rounded, j, exponent;

    if (status !== 0) {
        if (n !== n) {
            return 0x7fc00000;
        }
        if (n === Infinity) {
            return 0x7f800000;
        }
        if (n === -Infinity) {
            return 0xff800000
        }
    }

    i = len;
    while (i) {
        bin[--i] = 0;
    }

    i = 129;
    while (intPart && i) {
        bin[--i] = intPart % 2;
        intPart = Math.floor(intPart / 2);
    }

    i = 128;
    while (floatPart > 0 && i) {
        (bin[++i] = ((floatPart *= 2) >= 1) - 0) && --floatPart;
    }

    i = -1;
    while (++i < len && !bin[i]);

    if (bin[(lastBit = 22 + (i = (exp = 128 - i) >= -126 && exp <= 127 ? i + 1 : 128 - (exp = -127))) + 1]) {
        if (!(rounded = bin[lastBit])) {
            j = lastBit + 2;
            while (!rounded && j < len) {
                rounded = bin[j++];
            }
        }

        j = lastBit + 1;
        while (rounded && --j >= 0) {
            (bin[j] = !bin[j] - 0) && (rounded = 0);
        }
    }
    i = i - 2 < 0 ? -1 : i - 3;
    while (++i < len && !bin[i]);
    (exp = 128 - i) >= -126 && exp <= 127 ? ++i : exp < -126 && (i = 255, exp = -127);
    (intPart || status !== 0) && (exp = 128, i = 129, status == -Infinity ? signal = 1 : (status !== status) && (bin[i] = 1));

    n = Math.abs(exp + 127);
    exponent = 0;
    j = 0;
    while (j < 8) {
        exponent += (n % 2) << j;
        n >>= 1;
        j++;
    }

    var mantissa = 0;
    n = i + 23;
    for (; i < n; i++) {
        mantissa = (mantissa << 1) + bin[i];
    }

    return ((signal ? 0x80000000 : 0) + (exponent << 23) + mantissa) | 0;
};

BinString.prototype.WriteFloat = function (flt) {
    var i = this.EncodeFloat(flt);
    this.WriteInt32(i);
    return this.contents;
};

BinString.prototype.btoa = function (s) {
    var i;

    for (i = 0; i < s.length; i++) {
        if (s.charCodeAt(i) > 255) {
            return null;
        }
    }

    var out = "";

    for (i = 0; i < s.length; i += 3) {
        var groupsOfSix = [undefined, undefined, undefined, undefined];
        groupsOfSix[0] = s.charCodeAt(i) >> 2;
        groupsOfSix[1] = (s.charCodeAt(i) & 0x03) << 4;

        if (s.length > i + 1) {
            groupsOfSix[1] |= s.charCodeAt(i + 1) >> 4;
            groupsOfSix[2] = (s.charCodeAt(i + 1) & 0x0f) << 2;
        }

        if (s.length > i + 2) {
            groupsOfSix[2] |= s.charCodeAt(i + 2) >> 6;
            groupsOfSix[3] = s.charCodeAt(i + 2) & 0x3f;
        }

        for (var j = 0; j < groupsOfSix.length; j++) {
            if (typeof groupsOfSix[j] === "undefined") {
                out += "=";
            }
            else {
                out += this.btoaLookup(groupsOfSix[j]);
            }
        }
    }
    return out;
};

BinString.prototype.btoaLookup = function (idx) {
    if (idx < 26) {
        return String.fromCharCode(idx + "A".charCodeAt(0));
    }
    if (idx < 52) {
        return String.fromCharCode(idx - 26 + "a".charCodeAt(0));
    }
    if (idx < 62) {
        return String.fromCharCode(idx - 52 + "0".charCodeAt(0));
    }
    if (idx === 62) {
        return "+";
    }
    if (idx === 63) {
        return "/";
    }
    return undefined;
};

BinString.prototype.Base64Str = function () {
    return this.btoa(this.contents);
};
