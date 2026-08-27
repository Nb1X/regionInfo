const SERVER_SUFFIX = "-Master-1";

function intToBytes(num, length, littleEndian = false) {
    const bytes = [];
    for (let i = 0; i < length; i++) {
        if (littleEndian) {
            bytes.push(num & 0xFF);
            num >>= 8;
        } else {
            bytes.unshift(num & 0xFF);
            num >>= 8;
        }
    }
    return bytes;
}

function stringToBytes(str) {
    return Array.from(str).map(char => char.charCodeAt(0));
}

function bytesToHexString(bytes) {
    return bytes.map(byte => "0x" + byte.toString(16).padStart(2, "0")).join(", ");
}

function downloadFile(filename, data) {
    const blob = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function createFile() {
    try {
        const regionName = document.getElementById("regionName").value.trim();
        const ipAddress = document.getElementById("ipAddress").value.trim();
        const port = parseInt(document.getElementById("port").value);
        const fileName = document.getElementById("fileName").value.trim();
        
        if (!regionName) throw new Error("Region name cannot be empty");
        if (!ipAddress) throw new Error("IP address cannot be empty");
        if (!fileName) throw new Error("File name cannot be empty");
        if (!port || port < 1 || port > 32767) throw new Error("Invalid port");
        
        // Validate IP format
        const ipParts = ipAddress.split(".");
        if (ipParts.length !== 4) {
            throw new Error("Invalid IP address. Use format: 192.168.1.1");
        }
        ipParts.forEach(part => {
            const num = parseInt(part);
            if (isNaN(num) || num < 0 || num > 255) {
                throw new Error("Invalid IP address octet: " + part);
            }
        });
        
        const serverName = regionName + SERVER_SUFFIX;
        
        if (serverName.length > 255) throw new Error("Region name too long");
        if (ipAddress.length > 255) throw new Error("IP-address too long");
        if (port > 32767) throw new Error("Port too high");
        
        let data = [];
        
        // Region name (5 bytes length + string)
        data.push(...intToBytes(regionName.length, 5));
        data.push(...stringToBytes(regionName));
        
        // IP address string
        data.push(ipAddress.length);
        data.push(...stringToBytes(ipAddress));
        data.push(...intToBytes(1, 4, true));
        
        // Server name
        data.push(serverName.length);
        data.push(...stringToBytes(serverName));
        
        // IP address in byte form
        let ipBytes = [];
        ipAddress.split(".").forEach(octet => {
            ipBytes.push(parseInt(octet));
        });
        data.push(...ipBytes);
        
        // Port (2 bytes little endian)
        data.push(...intToBytes(port, 2, true));
        
        // Extra bytes
        data.push(...intToBytes(0, 4));
        
        // Download the file
        downloadFile(fileName, data);
        
        // Show output
        const output = document.getElementById("output");
        output.style.display = "block";
        output.className = "success";
        output.innerHTML = `File created!<br>Size: ${data.length} bytes<br><br>Bytes: {${bytesToHexString(data)}}`;
        
        document.getElementById("status").textContent = "File downloaded";
        document.getElementById("status").style.color = "#fff";
        
    } catch (error) {
        const output = document.getElementById("output");
        output.style.display = "block";
        output.className = "error";
        output.innerHTML = `Error: ${error.message}`;
        
        document.getElementById("status").textContent = "Error";
        document.getElementById("status").style.color = "#ff0000";
    }
}
