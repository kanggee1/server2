import fs from "fs/promises";
import fetch from "node-fetch";
import pLimit from "p-limit";

const inputFile = process.env.IP_FILE || "cek/file.txt";
const aliveFile = "cek/proxyList.txt";
const deadFile = "cek/dead.txt";
const apiUrlTemplate = process.env.API_URL || "https://api.checker-ip.web.id/check?ip={ip}:{port}";

const limit = pLimit(50); // Batasi jumlah request yang berjalan bersamaan

async function checkProxy(line) {
    const parts = line.split(",");
    if (parts.length < 4) return null; // Abaikan baris yang tidak sesuai format

    const [ip, port, country, isp] = parts.map(p => p.trim());
    const apiUrl = apiUrlTemplate.replace("{ip}", ip).replace("{port}", port);

    try {
        const response = await fetch(apiUrl, { timeout: 60000 });
        if (!response.ok) {
            console.log(`⚠️ ${ip}:${port} - HTTP ${response.status}`);
            return false;
        }
        
        const data = await response.json();
        if (data.status && data.status.toLowerCase() === "active") {
            console.log(`✅ ${ip}:${port} is ACTIVE`);
            return `${ip},${port},${country},${isp}`; // Format untuk file output
        } else {
            console.log(`❌ ${ip}:${port} is DEAD`);
            return false;
        }
    } catch (error) {
        console.error(`Error checking ${ip}:${port}: ${error.message}`);
        return false;
    }
}

async function main() {
    try {
        console.log("🚀 Starting Proxy Check...");

        // Baca file input
        const data = await fs.readFile(inputFile, "utf-8");
        const proxies = data.split("\n").map(line => line.trim()).filter(line => line);

        // Kosongkan file output sebelum menulis data baru
        await fs.writeFile(aliveFile, "", "utf-8");
        await fs.writeFile(deadFile, "", "utf-8");

        // Cek proxy secara paralel
        const results = await Promise.all(proxies.map(proxy => limit(() => checkProxy(proxy))));

        // Simpan hasilnya ke file masing-masing
        const aliveProxies = results.filter(result => result);
        const deadProxies = results.filter(result => result === false);

        if (aliveProxies.length) {
            await fs.writeFile(aliveFile, aliveProxies.join("\n") + "\n", "utf-8");
            console.log(`✅ Semua proxy yang aktif disimpan di ${aliveFile}`);
        }

        if (deadProxies.length) {
            await fs.writeFile(deadFile, deadProxies.map(p => p || "").join("\n") + "\n", "utf-8");
            console.log(`❌ Semua proxy yang mati disimpan di ${deadFile}`);
        }

        console.log("🎉 Proxy check selesai!");
    } catch (error) {
        console.error("🚨 Error:", error);
    }
}

// Jalankan skrip
main();
