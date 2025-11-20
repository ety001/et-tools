export interface IPv4Result {
    network: string;
    broadcast: string;
    firstIP: string;
    lastIP: string;
    mask: string;
    hosts: number;
    cidr: number;
    error?: string;
}

export interface IPv6Result {
    expanded: string;
    compressed: string;
    error?: string;
}

// Helper to convert IP to long
function ip2long(ip: string): number {
    let components;
    if ((components = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/))) {
        let ipl = 0;
        components.shift();
        for (const part of components) {
            ipl *= 256;
            ipl += parseInt(part);
        }
        return ipl;
    }
    return 0;
}

// Helper to convert long to IP
function long2ip(ipl: number): string {
    return (
        (ipl >>> 24) +
        "." +
        ((ipl >> 16) & 255) +
        "." +
        ((ipl >> 8) & 255) +
        "." +
        (ipl & 255)
    );
}

export function calculateIPv4Subnet(ip: string, cidr: number): IPv4Result {
    if (!ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
        return {
            network: "",
            broadcast: "",
            firstIP: "",
            lastIP: "",
            mask: "",
            hosts: 0,
            cidr: 0,
            error: "Invalid IP Address",
        };
    }

    if (cidr < 0 || cidr > 32) {
        return {
            network: "",
            broadcast: "",
            firstIP: "",
            lastIP: "",
            mask: "",
            hosts: 0,
            cidr: 0,
            error: "Invalid CIDR",
        };
    }

    const ipLong = ip2long(ip);
    const maskLong = -1 << (32 - cidr);
    const networkLong = ipLong & maskLong;
    const broadcastLong = networkLong | ~maskLong;

    const hosts = Math.pow(2, 32 - cidr) - 2;
    const firstIPLong = networkLong + 1;
    const lastIPLong = broadcastLong - 1;

    return {
        network: long2ip(networkLong),
        broadcast: long2ip(broadcastLong),
        firstIP: cidr === 32 ? long2ip(networkLong) : long2ip(firstIPLong),
        lastIP: cidr === 32 ? long2ip(networkLong) : long2ip(lastIPLong),
        mask: long2ip(maskLong),
        hosts: hosts > 0 ? hosts : 0,
        cidr,
    };
}

export function expandIPv6(ip: string): string {
    // Basic validation
    if (!/^[0-9a-fA-F:]+$/.test(ip)) return "Invalid IPv6 Address";

    let fullAddress = "";
    const parts = ip.split(":");

    if (parts.length > 8) return "Invalid IPv6 Address";

    // Handle double colon ::
    if (ip.includes("::")) {
        const [left, right] = ip.split("::");
        const leftParts = left ? left.split(":") : [];
        const rightParts = right ? right.split(":") : [];
        const missing = 8 - (leftParts.length + rightParts.length);

        if (missing < 0) return "Invalid IPv6 Address";

        const zeros = Array(missing).fill("0000");
        const newParts = [...leftParts, ...zeros, ...rightParts];

        fullAddress = newParts.map(part => part.padStart(4, "0")).join(":");
    } else {
        if (parts.length !== 8) return "Invalid IPv6 Address";
        fullAddress = parts.map(part => part.padStart(4, "0")).join(":");
    }

    return fullAddress;
}

export function compressIPv6(ip: string): string {
    // First expand it to ensure we have a standard format to work with
    const expanded = expandIPv6(ip);
    if (expanded === "Invalid IPv6 Address") return expanded;

    // Remove leading zeros in each block
    let parts = expanded.split(":").map(part => part.replace(/^0+/, "") || "0");

    // Find the longest sequence of zeros
    let bestStart = -1;
    let bestLen = 0;
    let currentStart = -1;
    let currentLen = 0;

    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === "0") {
            if (currentStart === -1) {
                currentStart = i;
            }
            currentLen++;
        } else {
            if (currentLen > bestLen) {
                bestLen = currentLen;
                bestStart = currentStart;
            }
            currentStart = -1;
            currentLen = 0;
        }
    }
    // Check trailing sequence
    if (currentLen > bestLen) {
        bestLen = currentLen;
        bestStart = currentStart;
    }

    if (bestLen > 1) {
        parts.splice(bestStart, bestLen, "");
        // If we replaced the start or end, we need an extra colon
        if (bestStart === 0) parts.unshift("");
        if (bestStart + bestLen === 8) parts.push("");
    }

    return parts.join(":").replace(/:{3,}/g, "::");
}
