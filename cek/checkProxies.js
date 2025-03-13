import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// Konfigurasi file
const INPUT_FILE = process.env.IP_FILE || path.join("cek", "file.txt");
const ALIVE_FILE = process.env.ALIVE_FILE || path.join("cek", "proxyList.txt");
const DEAD_FILE = process.env.DEAD_FILE || path.join("cek", "dead.txt");
const API_URL_TEMPLATE = process.env.API_URL || "https://api.checker-ip.web.id/check?ip={ip}:{port}";

// Fungsi untuk mengecek proxy
async function checkProxy(ip, port) {
    const apiUrl = API_URL_TEMPLATE.replace("{ip}", ip).replace("{port}", port);
    try {
        const response = await fetch(apiUrl, { timeout: 60000 });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.status && data.status.toLowerCase() === "active") {
            console.log(`${ip}:${port} is ✅ ACTIVE`);
            return { ip, port, status: "alive" };
        } else {
            console.log(`${ip}:${port} is ❌ DEAD`);
            return { ip, port, status: "dead" };
        }
    } catch (error) {
        console.error(`Error checking ${ip}:${port}:`, error.message);
        return { ip, port, status: "dead" };
    }
}

// Fungsi utama
async function main() {
    try {
        await fs.writeFile(ALIVE_FILE, "");
        await fs.writeFile(DEAD_FILE, "");

        const fileData = await fs.readFile(INPUT_FILE, "utf-8");
        const proxyList = fileData
            .split("\n")
            .map(line => line.trim().split(","))
            .filter(row => row.length >= 2);

        if (proxyList.length === 0) {
            console.warn("Tidak ada proxy yang valid dalam file input.");
            return;
        }

        console.log(`Memeriksa ${proxyList.length} proxy...`);
        const results = await Promise.all(proxyList.map(([ip, port]) => checkProxy(ip, port)));

        const aliveProxies = results.filter(p => p.status === "alive").map(p => `${p.ip},${p.port}`).join("\n");
        const deadProxies = results.filter(p => p.status === "dead").map(p => `${p.ip},${p.port}`).join("\n");

        if (aliveProxies) await fs.appendFile(ALIVE_FILE, aliveProxies + "\n");
        if (deadProxies) await fs.appendFile(DEAD_FILE, deadProxies + "\n");

        console.log(`✅ Semua proxy yang ALIVE telah disimpan di ${ALIVE_FILE}.`);
        console.log(`❌ Semua proxy yang DEAD telah disimpan di ${DEAD_FILE}.`);
    } catch (error) {
        console.error("Terjadi kesalahan:", error.message);
    }
}

main();
