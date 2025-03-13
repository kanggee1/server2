import fs from "fs/promises";
import fetch from "node-fetch";
import pLimit from "p-limit";

const API_URL_TEMPLATE = process.env.API_URL || "https://api.checker-ip.web.id/check?ip={ip}:{port}";
const INPUT_FILE = process.env.IP_FILE || "cek/file.txt";
const ALIVE_FILE = "cek/proxyList.txt";
const DEAD_FILE = "cek/dead.txt";

const limit = pLimit(10); // Batasi 10 request bersamaan

async function fetchWithRetry(url, retries = 3, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { timeout: 60000 });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Attempt ${i + 1}: Error fetching ${url} - ${error.message}`);
            if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
        }
    }
    return null;
}

async function checkProxy(ip, port, country, isp) {
    const apiUrl = API_URL_TEMPLATE.replace("{ip}", ip).replace("{port}", port);
    const data = await fetchWithRetry(apiUrl);

    if (data && data.status?.toLowerCase() === "active") {
        console.log(`${ip}:${port} is ✅ ACTIVE`);
        return `${ip},${port},${country},${isp}`;
    } else {
        console.log(`${ip}:${port} is ❌ DEAD`);
        return null;
    }
}

async function main() {
    try {
        const fileContent = await fs.readFile(INPUT_FILE, "utf-8");
        const proxies = fileContent.split("\n").map(line => line.trim().split(",")).filter(row => row.length >= 4);

        if (proxies.length === 0) {
            console.log("❌ Tidak ada proxy yang ditemukan di file.");
            return;
        }

        const tasks = proxies.map(([ip, port, country, isp]) => 
            limit(() => checkProxy(ip, port, country, isp))
        );
        const results = await Promise.all(tasks);

        const aliveProxies = results.filter(p => p !== null).join("\n");
        const deadProxies = proxies.filter((_, i) => results[i] === null).map(p => p.join(",")).join("\n");

        await fs.writeFile(ALIVE_FILE, aliveProxies, "utf-8");
        await fs.writeFile(DEAD_FILE, deadProxies, "utf-8");

        console.log(`✅ Semua proxy yang ALIVE disimpan di ${ALIVE_FILE}`);
        console.log(`✅ Semua proxy yang DEAD disimpan di ${DEAD_FILE}`);

    } catch (error) {
        console.error("❌ Terjadi kesalahan:", error);
    }
}

main();
