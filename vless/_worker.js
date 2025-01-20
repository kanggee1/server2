import { connect } from "cloudflare:sockets";

// Variables
const rootDomain = "foolvpn.me"; // Ganti dengan domain utama kalian
const serviceName = "nautica"; // Ganti dengan nama workers kalian
const apiKey = ""; // Ganti dengan Global API key kalian (https://dash.cloudflare.com/profile/api-tokens)
const apiEmail = ""; // Ganti dengan email yang kalian gunakan
const accountID = ""; // Ganti dengan Account ID kalian (https://dash.cloudflare.com -> Klik domain yang kalian gunakan)
const zoneID = ""; // Ganti dengan Zone ID kalian (https://dash.cloudflare.com -> Klik domain yang kalian gunakan)
let isApiReady = false;
let proxyIP = "";
let cachedProxyList = [];

// Constant
const APP_DOMAIN = `${serviceName}.${rootDomain}`;
const PORTS = [443, 80];
const PROTOCOLS = ["trojan", "vless", "ss"];
const PROXY_BANK_URL = "https://raw.githubusercontent.com/jaka2m/botak/refs/heads/main/proxyList.txt";
const DNS_SERVER_ADDRESS = "1.1.1.1";
const DNS_SERVER_PORT = 53;
const PROXY_PER_PAGE = 24;
const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;
const CORS_HEADER_OPTIONS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

async function getKVProxyList(kvProxyUrl = KV_PROXY_URL) {
  if (!kvProxyUrl) {
    throw new Error("No KV Proxy URL Provided!");
  }

  const kvProxy = await fetch(kvProxyUrl);
  if (kvProxy.status == 200) {
    return await kvProxy.json();
  } else {
    return {};
  }
}

async function getProxyList(proxyBankUrl = PROXY_BANK_URL) {
  /**
   * Format:
   *
   * <IP>,<Port>,<Country ID>,<ORG>
   * Contoh:
   * 1.1.1.1,443,SG,Cloudflare Inc.
   */
  if (!proxyBankUrl) {
    throw new Error("No Proxy Bank URL Provided!");
  }

  const proxyBank = await fetch(proxyBankUrl);
  if (proxyBank.status == 200) {
    const text = (await proxyBank.text()) || "";

    const proxyString = text.split("\n").filter(Boolean);
    cachedProxyList = proxyString
      .map((entry) => {
        const [proxyIP, proxyPort, country, org] = entry.split(",");
        return {
          proxyIP: proxyIP || "Unknown",
          proxyPort: proxyPort || "Unknown",
          country: country || "Unknown",
          org: org || "Unknown Org",
        };
      })
      .filter(Boolean);
  }

  return cachedProxyList;
}

function buildCountryFlag() {
  const flagList = cachedProxyList.map((proxy) => proxy.country);
  const uniqueFlags = new Set(flagList);

  let flagElement = "";
  for (const flag of uniqueFlags) {
    if (flag && flag !== "Unknown") {
      try {
        flagElement += `<a href="/?cc=${flag}" class="py-1">
      <img width="35"
        style="bg-dark margin-right: 8px; border: 3px solid transparent; border-radius: 50%; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); flex-shrink: 0; max-width: 55px; max-height: 55px; background: linear-gradient(90deg, #39ff14, #008080); border-image: linear-gradient(90deg, #39ff14, #008080) 1;"
        src="https://installer.us.kg/circle-flags/flags/${flag.toLowerCase()}.svg" />
        </a>`;
      } catch (err) {
        console.error(`Error generating flag for country: ${flag}`, err);
      }
    }
  }

  return flagElement;
}

async function reverseProxy(request, target, targetPath) {
  const targetUrl = new URL(request.url);
  const targetChunk = target.split(":");

  targetUrl.hostname = targetChunk[0];
  targetUrl.port = targetChunk[1]?.toString() || "443";
  targetUrl.pathname = targetPath || targetUrl.pathname;

  const modifiedRequest = new Request(targetUrl, request);

  modifiedRequest.headers.set("X-Forwarded-Host", request.headers.get("Host"));

  const response = await fetch(modifiedRequest);

  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(CORS_HEADER_OPTIONS)) {
    newResponse.headers.set(key, value);
  }
  newResponse.headers.set("X-Proxied-By", "Cloudflare Worker");

  return newResponse;
}

function getAllConfig(request, hostName, proxyList, page = 0) {
  const PROXY_PER_PAGE = 25; 
  const startIndex = PROXY_PER_PAGE * page;

  try {
    const uuid = crypto.randomUUID();
    const ports = [443, 80];
    const protocols = ["trojan", "vless", "ss"];

    // Build BASE_URL dynamically
    const url = new URL(request.url);
    const BASE_URL = `https://${url.hostname}`; 
    const CHECK_API = `${BASE_URL}/geo-ip?ip=`; 

    // Build URI
    const uri = new URL(`trojan://${hostName}`);
    uri.searchParams.set("encryption", "none");
    uri.searchParams.set("type", "ws");
    uri.searchParams.set("host", hostName);

    const pathSegments = url.pathname.split('/'); // Memecah path berdasarkan '/'
    const pageParam = pathSegments[1] || 0; // Ambil parameter halaman dari URL (misalnya /1 -> page = 1)

    const currentPage = parseInt(pageParam, 10); // Mengubah string ke integer untuk halaman
    const queryParams = url.searchParams;
    let filteredProxyList = proxyList.slice(); // Salin proxy list untuk di-filter lebih lanjut

    // Debug log untuk melihat query parameter
    console.log(`Query parameters: ${url.searchParams.toString()}`);

    // Filter berdasarkan query parameter
    if (queryParams.has('query')) {
      const query = queryParams.get('query').toLowerCase();
      console.log(`Query search term: ${query}`); // Log query pencarian

      filteredProxyList = filteredProxyList.filter(proxy => {
        console.log(`Checking proxy: ${JSON.stringify(proxy)}`); // Log proxy yang sedang diperiksa
        return proxy.proxyIP && proxy.proxyIP.includes(query) || // Pencarian berdasarkan IP
               proxy.proxyPort.toString().includes(query) || // Pencarian berdasarkan port
               proxy.org.toLowerCase().includes(query) || // Pencarian berdasarkan organisasi
               proxy.country.toLowerCase().includes(query); // Pencarian berdasarkan kode negara
      });
    }

  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FREE VPN CLOUDFLARE</title>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      :root {
        --primary: #00ff88;
        --secondary: #00ffff;
        --accent: #ff00ff;
        --dark: #080c14;
        --darker: #040608;
        --light: #e0ffff;
        --card-bg: rgba(8, 12, 20, 0.95);
        --glow: 0 0 20px rgba(0, 255, 136, 0.3);
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Space Grotesk', sans-serif;
      }

      body {
        background: var(--darker);
        color: var(--light);
        min-height: 85vh;
        background: url('https://picsum.photos/1024/1024?') no-repeat center center fixed;
      }

      .quantum-container {
        max-width: 1200px;
        margin: 2rem auto;
        padding: 2rem;
        perspective: 1000px;
        background: rgba(0, 0, 0, 0.5);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            animation: fadeIn 1s ease-in-out;
            overflow-y: auto;
      }

      .quantum-card {
        max-width: 100%;
        background: rgba(6, 18, 67, 0.50);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 255, 136, 0.2);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: var(--glow);
        transform-style: preserve-3d;
        
      }

      @keyframes cardFloat {
        0%, 100% { transform: translateY(0) rotateX(0); }
        50% { transform: translateY(-10px) rotateX(2deg); }
      }

      .quantum-title {
        font-family: 'Rajdhani', sans-serif;
        font-size: 4rem;
        font-weight: 700;
        text-align: center;
        margin-top: 1rem;
        margin-bottom: 2rem;
        background: linear-gradient(45deg, var(--primary), var(--secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
        position: relative;
        
      }

      @keyframes titlePulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.02); filter: brightness(1.2); }
      }

      .quantum-table {
        width: 100%;
        min-width: 800px;
        border-collapse: separate;
        border-spacing: 0 8px;
      }

.quantum-table td {
  padding: 1rem;
  font-weight: 500;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 2px;
  background: rgba(0, 255, 136, 0.03);
  border-left: 1px solid rgba(0, 255, 136, 0.2); /* Garis vertikal lebih halus */
  border-bottom: 1px solid rgba(0, 255, 136, 0.2); /* Garis horizontal lebih halus */
  transition: all 0.3s ease;
}

.quantum-table tr {
  transition: all 0.3s ease;
}

.quantum-table tr:hover td {
  background: rgba(0, 255, 136, 0.08);
  transform: scale(1.01);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.1);
}

/* Menghilangkan border pada baris terakhir dan kolom terakhir agar lebih bersih */
.quantum-table tr:last-child td {
  border-bottom: none;
}

.quantum-table td:last-child {
  border-right: none;
}

.quantum-table {
  border-collapse: collapse; /* Menyatukan border antar elemen */
}

.quantum-table th, .quantum-table td {
  padding: 1rem;
  text-align: center; /* Menyusun teks di tengah */
  font-family: 'Rajdhani', sans-serif;
}

/* Garis pembatas bawah header tabel dengan warna hijau halus */
.quantum-table th {
        background: rgba(0, 255, 136, 0.1);
        color: var(--primary);
        padding: 1.2rem;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        font-size: 1.1rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        border-bottom: 2px solid var(--primary);
        white-space: nowrap;
        position: sticky;
        top: 0;
        z-index: 10;
      }

/* Garis pembatas vertikal antar kolom dengan warna hijau halus */
.quantum-table th, .quantum-table td {
  border-right: 1px solid rgba(0, 255, 136, 0.3); /* Garis vertikal hijau halus antar kolom */
}

/* Garis pembatas bawah setiap baris data dengan warna hijau halus */
.quantum-table td {
  background: rgba(0, 255, 136, 0.03);
  border-bottom: 1px solid rgba(0, 255, 136, 0.2); /* Garis horizontal hijau halus antar baris */
  transition: all 0.3s ease;
}

.quantum-table tr:hover td {
  background: rgba(0, 255, 136, 0.08);
  transform: scale(1.01);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.1);
}

/* Tidak ada perubahan pada border, biarkan semuanya tampil */
.quantum-table td {
  border: 1px solid rgba(0, 255, 136, 0.2); /* Contoh: border tetap untuk semua sel */
}

.quantum-table td:last-child {
  border-right: 1px solid rgba(0, 255, 136, 0.2);
}

      .quantum-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 2rem;
        background: var(--primary);
        color: var(--dark);
        border-radius: 12px;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
        transform: translateY(100%);
        opacity: 0;
        
        z-index: 1000;
      }

      @keyframes toastSlide {
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* Mobile Responsiveness */
      @media (max-width: 768px) {
        .quantum-container {
          padding: 0.5rem;
          margin: 0.5rem;
        }
        
        .quantum-card {
          padding: 1rem;
          margin: 0;
          width: 100%;
          border-radius: 10px;
          max-width: 100%;
        }
    
        .quantum-title {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
    
        .table-wrapper {
          margin: 0.5rem 0;
          padding: 0;
          border-radius: 10px;
          max-height: 60vh; /* Restrict the height of the table */
          overflow-y: auto; /* Allow scrolling within the table */
          background: rgba(6, 18, 67, 0.89);
        }
    
        .quantum-toast {
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          text-align: center;
        }
      }

      @media (max-width: 480px) {
        .quantum-card {
          padding: 0.5rem;
          max-width: 100%;
        }
    
        .quantum-title {
          font-size: 1.5rem;
        }
    
        .table-wrapper {
          margin: 0.5rem -0.5rem;
          padding: 0 0.5rem;
        }
    
        .quantum-table {
          font-size: 0.8rem;
        }
    
      .table-wrapper {
        width: 100%;
        max-height: calc(80vh - 200px); /* Atur tinggi maksimal untuk scroll */
        overflow-y: auto; /* Aktifkan scroll vertikal */
        -webkit-overflow-scrolling: touch; /* Lancar di perangkat touch */
        margin: 1rem 0;
        border-radius: 10px;
        background: rgba(0, 255, 136, 0.02);
      }

      .table-wrapper:hover {
        pointer-events: auto; /* Izinkan scroll pada hover */
      }

      .table-wrapper::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .table-wrapper::-webkit-scrollbar-track {
        background: rgba(0, 255, 136, 0.1);
        border-radius: 4px;
      }

      .table-wrapper::-webkit-scrollbar-thumb {
        background: var(--primary);
        border-radius: 4px;
      }

      .table-wrapper::-webkit-scrollbar-thumb:hover {
        background: var(--secondary);
      }
      
    button {
    background-color: rgba(46, 204, 113, 0.8); /* Warna hijau dengan transparansi yang lebih jelas */
    color: white;
    padding: 8px 18px;
    margin: 1px;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    font-size: 11px;
    font-weight: bold;
    transition: background 0.3s;
}

button:hover {
    background-color: rgba(46, 204, 113, 1); /* Warna hijau solid lebih cerah saat hover */
    transform: translateY(-2px); /* Efek pergeseran saat hover */
}

button:active {
    transform: translateY(2px); /* Efek pergeseran saat aktif */
}

button.small {
    padding: 8px 13px;
    font-size: 16px;
    border-radius: 7px;
}
.small-font-popup {
    font-size: 13px;
}

.close-btn {
    background-color: #dc3545;
    color: white;
    padding: 6px 11px;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
}

.close-btn:hover {
    background-color: #c82333;
}

    .quantum-title a:hover {
            color: #2980b9;
        }

.quantum-form {
  margin-top: 20px; /* Dikurangi */
  display: flex;
  justify-content: center;
}

.quantum-input {
  padding: 8px 16px; /* Dikurangi */
  width: 65%; /* Dikurangi */
  max-width: 300px; /* Dikurangi */
  color: white;
  border-radius: 15px; /* Dikurangi */
  border: 1.5px solid rgba(46, 204, 113, 0.7); /* Border lebih tipis */
  background: rgba(46, 204, 113, 0.3); 
  backdrop-filter: blur(6px); /* Blur sedikit dikurangi */
  font-size: 14px; /* Dikurangi */
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.quantum-input:focus {
  border-color: rgba(46, 204, 113, 1);
  background: rgba(46, 204, 113, 0.4);
  box-shadow: 0 0 8px rgba(46, 204, 113, 0.5); /* Shadow lebih kecil */
}

.quantum-button {
  padding: 8px 16px; /* Dikurangi */
  margin-left: 15px; /* Dikurangi */
  border: none;
  background: rgba(46, 204, 113, 0.4);
  backdrop-filter: blur(6px); /* Blur sedikit dikurangi */
  color: white;
  border-radius: 15px; /* Dikurangi */
  font-size: 14px; /* Dikurangi */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.quantum-button:hover {
  background: rgba(46, 204, 113, 0.5);
  transform: translateY(-1px); /* Transformasi hover dikurangi */
}

.quantum-button:active {
  transform: translateY(1px); /* Transformasi aktif dikurangi */
}

{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}
.profile>img {
    width: 150px;
    height: 150px;
    border: 3px solid #222;
    border-radius: 100%;
}
.profile>p {
    font-size: 1.8em;
    font-weight: 900;
    letter-spacing: 2px;
    color: #fff;
    text-transform: capitalize;
    text-align: center;
}

.link {
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 20px;
}
.link>a {
    text-decoration: none;
    color: white;
    font-size: 20px;
    text-align: center;
    border: 1px solid white;
    border-radius: 7px;
    margin: 3px 40px;
    padding: 10px;
    text-transform: uppercase;
    font-weight: 500;
}
.link>a:hover {
    background-color: transparent;
}

/* Footer */
.footer {
    text-align: center;
}
.footer>i {
    color: white;
    font-size: 20px;
}

.spinner {
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 35px;
  height: 35px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.quantum-pagination {
    margin-top: 20px; /* Dikurangi */
    display: flex;
    justify-content: center;
}

.quantum-pagination a {
    padding: 8px 15px; /* Dikurangi */
    border: 1.5px solid #3498db; /* Lebar border dikurangi */
    color: #3498db;
    text-decoration: none;
    border-radius: 15px; /* Dikurangi */
    margin: 0 8px; /* Dikurangi */
    font-size: 14px; /* Dikurangi */
    transition: background-color 0.3s, color 0.3s, transform 0.2s;
}

.quantum-pagination a:hover {
    background-color: #3498db;
    color: white;
    transform: translateY(-1px); /* Dikurangi */
}

.quantum-pagination .disabled {
    pointer-events: none;
    opacity: 0.5;
}

</style>
</head>
<body>
	<div class="quantum-container">
    <h1 class="quantum-title">
            <a href="https://t.me/sampiiiiu" target="_blank">GEO PROJECT</a>
        </h1>
     <div class="flex justify-center mb-2">
  <form method="GET" class="flex items-center space-x-2 fixed top-20 left-1/2 transform -translate-x-1/2 z-10">
    <input
      type="text"
      name="query"
      id="query"
      placeholder="Search by IP, Port, Org, or Country"
      style="background: transparent; color: #39ff14; font-weight: bold; padding: 0.5rem; border: 1px solid #39ff14; border-radius: 0.375rem; caret-color: #39ff14; height: 2.5rem;"
    />
    <button
      type="submit"
      class="px-3 py-1 bg-gradient-to-r from-[#39ff14] to-[#008080] text-black font-semibold border-0 rounded-md transform transition hover:scale-105"
      style="height: 2.5rem;"
    >
      Search
    </button>
  </form>
</div>

<div class="mt-24 md:mt-20 px-0.5 md:px-3">
  <div class="flex justify-center mb-3">
    <div 
      class="w-full md:w-96 h-12 overflow-x-auto rounded-2xl px-2 py-1 flex items-center space-x-2 shadow-lg"
      style="background: transparent; border-image: linear-gradient(to right, #39ff14, #008080) 1; border-width: 1px; border-style: solid;">
      ${buildCountryFlag()}
    </div>
  </div>
</div>

  <div class="table-wrapper">
              <table class="quantum-table">
                <thead>
                    <tr>
                        <th>IP:PORT</th>
                        <th>STATUS IP</th>
                        <th>COUNTRY</th>
                        <th>ISP</th>
                        <th>VLESS</th>
                        <th>TROJAN</th>
                        <th>SHADOWSOCKS</th>
                    </tr>
                </thead>
                <tbody>`;

    // Menambahkan daftar proxy
    for (let i = startIndex; i < startIndex + PROXY_PER_PAGE; i++) {
      const proxy = filteredProxyList[i];
      if (!proxy) break;

      const { proxyIP, proxyPort, country, org } = proxy;
      const ipPort = `${proxyIP}:${proxyPort}`;
      const healthCheckUrl = `${CHECK_API}${proxyIP}:${proxyPort}`;

      const uriWithPath = new URL(uri);
      uriWithPath.searchParams.set("path", `/${proxyIP}-${proxyPort}`);
      uriWithPath.hash = `${country} ${org}`;

      const proxies = [];
      for (const port of ports) {
        uriWithPath.port = port.toString();
        for (const protocol of protocols) {
          if (protocol === "ss") {
            uriWithPath.username = btoa(`none:${uuid}`);
          } else {
            uriWithPath.username = uuid;
          }

          uriWithPath.protocol = protocol;
          uriWithPath.searchParams.set("security", port == 443 ? "tls" : "none");
          uriWithPath.searchParams.set("sni", port == 80 && protocol == "vless" ? "" : hostName);

          proxies.push(uriWithPath.toString());
        }
      }

      htmlContent += `
                        <tr class="hover:bg-gray-800 transition duration-300 ease-in-out">
                        <td class="ip-cell">${ipPort}</td>
                        <td class="proxy-status" id="status-${ipPort}"><div class="spinner"></div></td>
                        <td class="border border-gray-700 px-1 py-1 text-center">
                        <img width="40" src="https://installer.us.kg/circle-flags/flags/${country.toLowerCase()}.svg" class="ms-2 rounded">
                        </td>
                        <td class="isp-cell">${country} | ${org}</td>
                        <td><button class="px-3 py-1 bg-gradient-to-r from-[#39ff14] to-[#008080] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="showOptions('VLess', '${proxies[1]}', '${proxies[4]}')">VLESS </button></td>
                        <td><button class="px-3 py-1 bg-gradient-to-r from-[#39ff14] to-[#008080] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="showOptions('Trojan', '${proxies[0]}', '${proxies[3]}')">TROJAN</button></td>
                        <td><button class="px-3 py-1 bg-gradient-to-r from-[#39ff14] to-[#008080] text-black font-semibold border-0 rounded-md transform transition hover:scale-105" onclick="showOptions('Shadowsocks', '${proxies[2]}', '${proxies[5]}')">SHADOWSOCKS</button>
                       </td>
                    </tr>
        <script>
            function showOptions(type, tls, ntls) {
    Swal.fire({
        width: '270px',
        html: \`
        <div class="flex items-center justify-center mb-2">
            <img width="70" src="https://installer.us.kg/circle-flags/flags/${country.toLowerCase()}.svg" class="ms-2 rounded" alt="${country} Flag">
        </div>
            <div class="h-px bg-[#4682b4] shadow-sm"></div>
<div class="text-xs">IP : ${ipPort}</div>
<div class="text-xs">ISP : ${org}</div>
<div class="text-xs">Country : ${country}</div>
<div class="h-px bg-[#4682b4] shadow-sm"></div>
<br>
<button class="bg-[#2ecc71] bg-opacity-80 py-2 px-3 text-xs rounded-md" onclick="copyToClipboard('\${tls}')">Copy TLS</button>
<button class="bg-[#2ecc71] bg-opacity-80 py-2 px-3 text-xs rounded-md" onclick="copyToClipboard('\${ntls}')">Copy NTLS</button>
<div class="mt-3">
    <button class="close-btn" onclick="Swal.close()">Close</button>
</div>
        \`,
        showCloseButton: false,
        showConfirmButton: false,
        background: 'rgba(6, 18, 67, 0.70)',
        color: 'white',
        customClass: {
            popup: 'rounded-popup',
            closeButton: 'close-btn'
        }
    });
}

            function copyToClipboard(text) {
                navigator.clipboard.writeText(text).then(() => {
                    Swal.fire({
                        title: 'Berhasil!',
                        width: '270px',
                        text: 'Teks berhasil disalin ke clipboard.',
                        icon: 'success',
                        background: 'rgba(6, 18, 67, 0.70)',
                        color: 'white',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }).catch(err => {
                    Swal.fire('Error!', 'Gagal menyalin teks.', 'error');
                });
            }
        </script>
<script>
          fetch('${healthCheckUrl}')
            .then(response => response.json())
            .then(data => {
              const statusElement = document.getElementById('status-${ipPort}');
              const spinner = document.getElementById('ping-' + data.proxy + ':' + data.port);

      // Ambil data status dan delay
      const status = data.status || 'UNKNOWN';
      const delay = data.delay || 'N/A';

              if (status === 'ACTIVE') {
    statusElement.innerHTML = 'ACTIVE<br><span style="color: gold;">(' + delay + ')</span>'; // Pisahkan ACTIVE dan delay
    statusElement.style.color = '#00FF00'; /* Warna hijau terang */
    statusElement.style.fontSize = '14px'; /* Ukuran font lebih besar */
    statusElement.style.fontWeight = 'bold'; /* Menebalkan teks */
} else if (status === 'DEAD') {
    statusElement.textContent = 'DEAD';
    statusElement.style.color = '#FF3333'; /* Warna merah terang */
    statusElement.style.fontSize = '14px'; /* Ukuran font lebih besar */
    statusElement.style.fontWeight = 'bold'; /* Menebalkan teks */
}

            })
            .catch(error => {
              const statusElement = document.getElementById('status-${ipPort}');
              statusElement.textContent = 'Error';
              statusElement.style.color = 'cyan';
            });
        </script>
        
`;
    }

    // Pagination Logic
    let prevPageLink = `/${currentPage > 0 ? currentPage - 1 : 0}`;
    let nextPageLink = `/${currentPage + 1}`;

    // Menonaktifkan tombol "Next" jika tidak ada lagi data
    if (startIndex + PROXY_PER_PAGE >= filteredProxyList.length) {
      nextPageLink = "#";
    }

    // Pagination
    htmlContent += `
      </tbody>
      </table>
      </div>
     <div class="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
    <nav class="bg-opacity-90 p-4 shadow-xl rounded-lg">
        <ul class="flex justify-center space-x-4">
            <li>
                <button class="px-3 py-1 bg-gradient-to-r from-[#39ff14] to-[#008080] text-black font-semibold border-0 rounded-md transform transition hover:scale-105">
                    <a href="${prevPageLink}">Prev</a>
                </button>
            </li>
            <li>
                <button disabled class="px-3 py-1 bg-gradient-to-r from-[#39ff14] to-[#008080] text-black font-semibold border-0 rounded-md cursor-not-allowed opacity-50">
                    ${currentPage + 1}
                </button>
            </li>
            <li>
                <button class="px-3 py-1 bg-gradient-to-r from-[#39ff14] to-[#008080] text-black font-semibold border-0 rounded-md transform transition hover:scale-105">
                    <a href="${nextPageLink}">Next</a>
                </button>
            </li>
        </ul>
    </nav>
</div>
</body>
      </html>
      <br>
      <br>`;

    return htmlContent;
  } catch (error) {
    return `An error occurred while generating the VLESS configurations. ${error}`;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const upgradeHeader = request.headers.get("Upgrade");
      const CHECK_API_BASE = env.CHECK_API_BASE; // Get base URL from secrets
      const CHECK_API = `${CHECK_API_BASE}/check?ip=`;

      // Handle proxy client
      if (upgradeHeader === "websocket") {
        const proxyMatch = url.pathname.match(/^\/(.+[:=-]\d+)$/);

        if (url.pathname.length == 3 || url.pathname.match(",")) {
          // Example: /ID, /SG, etc.
          const proxyKeys = url.pathname.replace("/", "").toUpperCase().split(",");
          const proxyKey = proxyKeys[Math.floor(Math.random() * proxyKeys.length)];
          
          let kvProxy = await env.nautica.get("kvProxy");
          if (kvProxy) {
            kvProxy = JSON.parse(kvProxy);
          } else {
            kvProxy = await getKVProxyList();
            env.nautica.put("kvProxy", JSON.stringify(kvProxy), {
              expirationTtl: 3600,
            });
          }

          proxyIP = kvProxy[proxyKey][Math.floor(Math.random() * kvProxy[proxyKey].length)];
          return await websocketHandler(request, proxyIP);
        } else if (proxyMatch) {
          proxyIP = proxyMatch[1];
          return await websocketHandler(request, proxyIP);
        }
      }

      // Handle IP check
      if (url.pathname === "/geo-ip") {
        const ip = url.searchParams.get("ip");

        if (!ip) {
          return new Response("IP parameter is required", { status: 400 });
        }

        // Call external API using CHECK_API
        const apiResponse = await fetch(`${CHECK_API}${ip}`);
        if (!apiResponse.ok) {
          return new Response("Failed to fetch IP information", { status: apiResponse.status });
        }

        const data = await apiResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.pathname.startsWith("/")) {
        const page = url.pathname.match(/^\/sub\/(\d+)$/);
        const pageIndex = parseInt(page ? page[1] : "0");
        const hostname = request.headers.get("Host");

        // Queries
        const countrySelect = url.searchParams.get("cc")?.split(",");
        const proxyBankUrl = url.searchParams.get("proxy-list") || env.PROXY_BANK_URL;
        let proxyList = (await getProxyList(proxyBankUrl)).filter((proxy) => {
          // Filter proxies by Country
          if (countrySelect) {
            return countrySelect.includes(proxy.country);
          }

          return true;
        });

        const result = getAllConfig(request, hostname, proxyList, pageIndex);
        return new Response(result, {
          status: 200,
          headers: { "Content-Type": "text/html;charset=utf-8" },
        });
      } else if (url.pathname.startsWith("/check")) {
        const target = url.searchParams.get("target").split(":");
        const result = await checkProxyHealth(target[0], target[1] || "443");

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            ...CORS_HEADER_OPTIONS,
            "Content-Type": "application/json",
          },
        });
      } else if (url.pathname.startsWith("/api/v1")) {
        const apiPath = url.pathname.replace("/api/v1", "");

        if (apiPath.startsWith("/domains")) {
          if (!isApiReady) {
            return new Response("Api not ready", {
              status: 500,
            });
          }

          const wildcardApiPath = apiPath.replace("/domains", "");
          const cloudflareApi = new CloudflareApi();

          if (wildcardApiPath == "/get") {
            const domains = await cloudflareApi.getDomainList();
            return new Response(JSON.stringify(domains), {
              headers: {
                ...CORS_HEADER_OPTIONS,
              },
            });
          } else if (wildcardApiPath == "/put") {
            const domain = url.searchParams.get("domain");
            const register = await cloudflareApi.registerDomain(domain);

            return new Response(register.toString(), {
              status: register,
              headers: {
                ...CORS_HEADER_OPTIONS,
              },
            });
          }
        } else if (apiPath.startsWith("/sub")) {
          const filterCC = url.searchParams.get("cc")?.split(",") || [];
          const filterPort = url.searchParams.get("port")?.split(",") || PORTS;
          const filterVPN = url.searchParams.get("vpn")?.split(",") || PROTOCOLS;
          const filterLimit = parseInt(url.searchParams.get("limit")) || 10;
          const filterFormat = url.searchParams.get("format") || "raw";
          const fillerDomain = url.searchParams.get("domain") || APP_DOMAIN;

          const proxyBankUrl = url.searchParams.get("proxy-list") || env.PROXY_BANK_URL;
          const proxyList = await getProxyList(proxyBankUrl)
            .then((proxies) => {
              // Filter CC
              if (filterCC.length) {
                return proxies.filter((proxy) => filterCC.includes(proxy.country));
              }
              return proxies;
            })
            .then((proxies) => {
              // shuffle result
              shuffleArray(proxies);
              return proxies;
            });

          const uuid = crypto.randomUUID();
          const result = [];
          for (const proxy of proxyList) {
            const uri = new URL(`trojan://${fillerDomain}`);
            uri.searchParams.set("encryption", "none");
            uri.searchParams.set("type", "ws");
            uri.searchParams.set("host", APP_DOMAIN);

            for (const port of filterPort) {
              for (const protocol of filterVPN) {
                if (result.length >= filterLimit) break;

                uri.protocol = protocol;
                uri.port = port.toString();
                if (protocol == "ss") {
                  uri.username = btoa(`none:${uuid}`);
                } else {
                  uri.username = uuid;
                }

                uri.searchParams.set("security", port == 443 ? "tls" : "none");
                uri.searchParams.set("sni", port == 80 && protocol == "vless" ? "" : APP_DOMAIN);
                uri.searchParams.set("path", `/${proxy.proxyIP}-${proxy.proxyPort}`);

                uri.hash = `${result.length + 1} ${getFlagEmoji(proxy.country)} ${proxy.org} WS ${
                  port == 443 ? "TLS" : "NTLS"
                } [${serviceName}]`;
                result.push(uri.toString());
              }
            }
          }

          let finalResult = "";
          switch (filterFormat) {
            case "raw":
              finalResult = result.join("\n");
              break;
            case "clash":
            case "sfa":
            case "bfr":
            case "v2ray":
              const encodedResult = [];
              for (const proxy of result) {
                encodedResult.push(encodeURIComponent(proxy));
              }

              // finalResult = `${CONVERTER_URL}?target=${filterFormat}&url=${encodedResult.join(",")}`;
              const res = await fetch(`${CONVERTER_URL}?target=${filterFormat}&url=${encodedResult.join(",")}`);
              if (res.status == 200) {
                finalResult = await res.text();
              } else {
                return new Response(res.statusText, {
                  status: res.status,
                  headers: {
                    ...CORS_HEADER_OPTIONS,
                  },
                });
              }
              break;
          }

          return new Response(finalResult, {
            status: 200,
            headers: {
              ...CORS_HEADER_OPTIONS,
            },
          });
        } else if (apiPath.startsWith("/myip")) {
          return new Response(
            JSON.stringify({
              ip:
                request.headers.get("cf-connecting-ipv6") ||
                request.headers.get("cf-connecting-ip") ||
                request.headers.get("x-real-ip"),
              colo: request.headers.get("cf-ray")?.split("-")[1],
              ...request.cf,
            }),
            {
              headers: {
                ...CORS_HEADER_OPTIONS,
              },
            }
          );
        }
      }

      const targetReverseProxy = env.REVERSE_PROXY_TARGET || "example.com";
      return await reverseProxy(request, targetReverseProxy);
    } catch (err) {
      return new Response(`An error occurred: ${err.toString()}`, {
        status: 500,
        headers: {
          ...CORS_HEADER_OPTIONS,
        },
      });
    }
  },
};

async function websocketHandler(request) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);

  webSocket.accept();

  let addressLog = "";
  let portLog = "";
  const log = (info, event) => {
    console.log(`[${addressLog}:${portLog}] ${info}`, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";

  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);

  let remoteSocketWrapper = {
    value: null,
  };
  let isDNS = false;

  readableWebSocketStream
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          if (isDNS) {
            return handleUDPOutbound(DNS_SERVER_ADDRESS, DNS_SERVER_PORT, chunk, webSocket, null, log);
          }
          if (remoteSocketWrapper.value) {
            const writer = remoteSocketWrapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          }

          const protocol = await protocolSniffer(chunk);
          let protocolHeader;

          if (protocol === "Trojan") {
            protocolHeader = parseTrojanHeader(chunk);
          } else if (protocol === "VLESS") {
            protocolHeader = parseVlessHeader(chunk);
          } else if (protocol === "Shadowsocks") {
            protocolHeader = parseShadowsocksHeader(chunk);
          } else {
            parseVmessHeader(chunk);
            throw new Error("Unknown Protocol!");
          }

          addressLog = protocolHeader.addressRemote;
          portLog = `${protocolHeader.portRemote} -> ${protocolHeader.isUDP ? "UDP" : "TCP"}`;

          if (protocolHeader.hasError) {
            throw new Error(protocolHeader.message);
          }

          if (protocolHeader.isUDP) {
            if (protocolHeader.portRemote === 53) {
              isDNS = true;
            } else {
              // return handleUDPOutbound(protocolHeader.addressRemote, protocolHeader.portRemote, chunk, webSocket, protocolHeader.version, log);
              throw new Error("UDP only support for DNS port 53");
            }
          }

          if (isDNS) {
            return handleUDPOutbound(
              DNS_SERVER_ADDRESS,
              DNS_SERVER_PORT,
              chunk,
              webSocket,
              protocolHeader.version,
              log
            );
          }

          handleTCPOutBound(
            remoteSocketWrapper,
            protocolHeader.addressRemote,
            protocolHeader.portRemote,
            protocolHeader.rawClientData,
            webSocket,
            protocolHeader.version,
            log
          );
        },
        close() {
          log(`readableWebSocketStream is close`);
        },
        abort(reason) {
          log(`readableWebSocketStream is abort`, JSON.stringify(reason));
        },
      })
    )
    .catch((err) => {
      log("readableWebSocketStream pipeTo error", err);
    });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

async function protocolSniffer(buffer) {
  if (buffer.byteLength >= 62) {
    const trojanDelimiter = new Uint8Array(buffer.slice(56, 60));
    if (trojanDelimiter[0] === 0x0d && trojanDelimiter[1] === 0x0a) {
      if (trojanDelimiter[2] === 0x01 || trojanDelimiter[2] === 0x03 || trojanDelimiter[2] === 0x7f) {
        if (trojanDelimiter[3] === 0x01 || trojanDelimiter[3] === 0x03 || trojanDelimiter[3] === 0x04) {
          return "Trojan";
        }
      }
    }
  }

  const vlessDelimiter = new Uint8Array(buffer.slice(1, 17));
  // Hanya mendukung UUID v4
  if (arrayBufferToHex(vlessDelimiter).match(/^[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$/i)) {
    return "VLESS";
  }

  return "Shadowsocks"; // default
}

async function handleTCPOutBound(
  remoteSocket,
  addressRemote,
  portRemote,
  rawClientData,
  webSocket,
  responseHeader,
  log
) {
  async function connectAndWrite(address, port) {
    const tcpSocket = connect({
      hostname: address,
      port: port,
    });
    remoteSocket.value = tcpSocket;
    log(`connected to ${address}:${port}`);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(rawClientData);
    writer.releaseLock();

    return tcpSocket;
  }

  async function retry() {
    const tcpSocket = await connectAndWrite(
      proxyIP.split(/[:=-]/)[0] || addressRemote,
      proxyIP.split(/[:=-]/)[1] || portRemote
    );
    tcpSocket.closed
      .catch((error) => {
        console.log("retry tcpSocket closed error", error);
      })
      .finally(() => {
        safeCloseWebSocket(webSocket);
      });
    remoteSocketToWS(tcpSocket, webSocket, responseHeader, null, log);
  }

  const tcpSocket = await connectAndWrite(addressRemote, portRemote);

  remoteSocketToWS(tcpSocket, webSocket, responseHeader, retry, log);
}

async function handleUDPOutbound(targetAddress, targetPort, udpChunk, webSocket, responseHeader, log) {
  try {
    let protocolHeader = responseHeader;
    const tcpSocket = connect({
      hostname: targetAddress,
      port: targetPort,
    });

    log(`Connected to ${targetAddress}:${targetPort}`);

    const writer = tcpSocket.writable.getWriter();
    await writer.write(udpChunk);
    writer.releaseLock();

    await tcpSocket.readable.pipeTo(
      new WritableStream({
        async write(chunk) {
          if (webSocket.readyState === WS_READY_STATE_OPEN) {
            if (protocolHeader) {
              webSocket.send(await new Blob([protocolHeader, chunk]).arrayBuffer());
              protocolHeader = null;
            } else {
              webSocket.send(chunk);
            }
          }
        },
        close() {
          log(`UDP connection to ${targetAddress} closed`);
        },
        abort(reason) {
          console.error(`UDP connection to ${targetPort} aborted due to ${reason}`);
        },
      })
    );
  } catch (e) {
    console.error(`Error while handling UDP outbound, error ${e.message}`);
  }
}

function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel) {
          return;
        }
        const message = event.data;
        controller.enqueue(message);
      });
      webSocketServer.addEventListener("close", () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) {
          return;
        }
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) {
        controller.error(error);
      } else if (earlyData) {
        controller.enqueue(earlyData);
      }
    },

    pull(controller) {},
    cancel(reason) {
      if (readableStreamCancel) {
        return;
      }
      log(`ReadableStream was canceled, due to ${reason}`);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    },
  });

  return stream;
}

function parseVmessHeader(vmessBuffer) {
  // https://xtls.github.io/development/protocols/vmess.html#%E6%8C%87%E4%BB%A4%E9%83%A8%E5%88%86
}

function parseShadowsocksHeader(ssBuffer) {
  const view = new DataView(ssBuffer);

  const addressType = view.getUint8(0);
  let addressLength = 0;
  let addressValueIndex = 1;
  let addressValue = "";

  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 3:
      addressLength = new Uint8Array(ssBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 4:
      addressLength = 16;
      const dataView = new DataView(ssBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `Invalid addressType for Shadowsocks: ${addressType}`,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: `Destination address empty, address type is: ${addressType}`,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = ssBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 2,
    rawClientData: ssBuffer.slice(portIndex + 2),
    version: null,
    isUDP: portRemote == 53,
  };
}

function parseVlessHeader(vlessBuffer) {
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isUDP = false;

  const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];

  const cmd = new Uint8Array(vlessBuffer.slice(18 + optLength, 18 + optLength + 1))[0];
  if (cmd === 1) {
  } else if (cmd === 2) {
    isUDP = true;
  } else {
    return {
      hasError: true,
      message: `command ${cmd} is not support, command 01-tcp,02-udp,03-mux`,
    };
  }
  const portIndex = 18 + optLength + 1;
  const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);

  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(vlessBuffer.slice(addressIndex, addressIndex + 1));

  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 2: // For Domain
      addressLength = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3: // For IPv6
      addressLength = 16;
      const dataView = new DataView(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invild  addressType is ${addressType}`,
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: `addressValue is empty, addressType is ${addressType}`,
    };
  }

  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    rawClientData: vlessBuffer.slice(addressValueIndex + addressLength),
    version: new Uint8Array([version[0], 0]),
    isUDP: isUDP,
  };
}

function parseTrojanHeader(buffer) {
  const socks5DataBuffer = buffer.slice(58);
  if (socks5DataBuffer.byteLength < 6) {
    return {
      hasError: true,
      message: "invalid SOCKS5 request data",
    };
  }

  let isUDP = false;
  const view = new DataView(socks5DataBuffer);
  const cmd = view.getUint8(0);
  if (cmd == 3) {
    isUDP = true;
  } else if (cmd != 1) {
    throw new Error("Unsupported command type!");
  }

  let addressType = view.getUint8(1);
  let addressLength = 0;
  let addressValueIndex = 2;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(
        "."
      );
      break;
    case 3: // For Domain
      addressLength = new Uint8Array(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(
        socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
      );
      break;
    case 4: // For IPv6
      addressLength = 16;
      const dataView = new DataView(socks5DataBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      break;
    default:
      return {
        hasError: true,
        message: `invalid addressType is ${addressType}`,
      };
  }

  if (!addressValue) {
    return {
      hasError: true,
      message: `address is empty, addressType is ${addressType}`,
    };
  }

  const portIndex = addressValueIndex + addressLength;
  const portBuffer = socks5DataBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);
  return {
    hasError: false,
    addressRemote: addressValue,
    addressType: addressType,
    portRemote: portRemote,
    rawDataIndex: portIndex + 4,
    rawClientData: socks5DataBuffer.slice(portIndex + 4),
    version: null,
    isUDP: isUDP,
  };
}

async function remoteSocketToWS(remoteSocket, webSocket, responseHeader, retry, log) {
  let header = responseHeader;
  let hasIncomingData = false;
  await remoteSocket.readable
    .pipeTo(
      new WritableStream({
        start() {},
        async write(chunk, controller) {
          hasIncomingData = true;
          if (webSocket.readyState !== WS_READY_STATE_OPEN) {
            controller.error("webSocket.readyState is not open, maybe close");
          }
          if (header) {
            webSocket.send(await new Blob([header, chunk]).arrayBuffer());
            header = null;
          } else {
            webSocket.send(chunk);
          }
        },
        close() {
          log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
        },
        abort(reason) {
          console.error(`remoteConnection!.readable abort`, reason);
        },
      })
    )
    .catch((error) => {
      console.error(`remoteSocketToWS has exception `, error.stack || error);
      safeCloseWebSocket(webSocket);
    });
  if (hasIncomingData === false && retry) {
    log(`retry`);
    retry();
  }
}

function safeCloseWebSocket(socket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error("safeCloseWebSocket error", error);
  }
}

async function checkProxyHealth(proxyIP, proxyPort) {
  const req = await fetch(`${PROXY_HEALTH_CHECK_API}?ip=${proxyIP}:${proxyPort}`);
  return await req.json();
}

// Helpers
function base64ToArrayBuffer(base64Str) {
  if (!base64Str) {
    return { error: null };
  }
  try {
    base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) {
    return { error };
  }
}

function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function shuffleArray(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

async function generateHashFromText(text) {
  const msgUint8 = new TextEncoder().encode(text); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("MD5", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string

  return hashHex;
}

function getFlagEmoji(isoCode) {
  const codePoints = isoCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// CloudflareApi Class
class CloudflareApi {
  constructor() {
    this.bearer = `Bearer ${apiKey}`;
    this.accountID = accountID;
    this.zoneID = zoneID;
    this.apiEmail = apiEmail;
    this.apiKey = apiKey;

    this.headers = {
      Authorization: this.bearer,
      "X-Auth-Email": this.apiEmail,
      "X-Auth-Key": this.apiKey,
    };
  }

  async getDomainList() {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/workers/domains`;
    const res = await fetch(url, {
      headers: {
        ...this.headers,
      },
    });

    if (res.status == 200) {
      const respJson = await res.json();

      return respJson.result.filter((data) => data.service == serviceName).map((data) => data.hostname);
    }

    return [];
  }

  async registerDomain(domain) {
    domain = domain.toLowerCase();
    const registeredDomains = await this.getDomainList();

    if (!domain.endsWith(rootDomain)) return 400;
    if (registeredDomains.includes(domain)) return 409;

    try {
      const domainTest = await fetch(`https://${domain.replaceAll("." + APP_DOMAIN, "")}`);
      if (domainTest.status == 530) return 530;
    } catch (e) {
      return 400;
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/workers/domains`;
    const res = await fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        environment: "production",
        hostname: domain,
        service: serviceName,
        zone_id: this.zoneID,
      }),
      headers: {
        ...this.headers,
      },
    });

    return res.status;
  }
}

class Document {
  proxies = [];

  constructor(request) {
    this.html = baseHTML;
    this.request = request;
    this.url = new URL(this.request.url);
  }

  setTitle(title) {
    this.html = this.html.replaceAll("PLACEHOLDER_JUDUL", title);
  }

  addInfo(text) {
    text = `<span>${text}</span>`;
    this.html = this.html.replaceAll("PLACEHOLDER_INFO", `${text}\nPLACEHOLDER_INFO`);
  }

  registerProxies(data, proxies) {
    this.proxies.push({
      ...data,
      list: proxies,
    });
  }

  buildProxyGroup() {
    let proxyGroupElement = "";
    proxyGroupElement += `<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">`;
    for (let i = 0; i < this.proxies.length; i++) {
      const proxyData = this.proxies[i];

      // Assign proxies
      proxyGroupElement += `<div class="lozad scale-95 mb-2 bg-white dark:bg-neutral-800 transition-transform duration-200 rounded-lg p-4 w-60 border-2 border-neutral-800">`;
      proxyGroupElement += `  <div id="countryFlag" class="absolute -translate-y-9 -translate-x-2 border-2 border-neutral-800 rounded-full overflow-hidden"><img width="32" src="https://installer.us.kg/circle-flags/flags/${proxyData.country.toLowerCase()}.svg" /></div>`;
      proxyGroupElement += `  <div>`;
      proxyGroupElement += `    <div id="ping-${i}" class="animate-pulse text-xs font-semibold dark:text-white">Idle ${proxyData.proxyIP}:${proxyData.proxyPort}</div>`;
      proxyGroupElement += `  </div>`;
      proxyGroupElement += `  <div class="rounded py-1 px-2 bg-amber-400 dark:bg-neutral-800 dark:border-2 dark:border-amber-400">`;
      proxyGroupElement += `    <h5 class="font-bold text-md text-neutral-900 dark:text-white mb-1 overflow-x-scroll scrollbar-hide text-nowrap">${proxyData.org}</h5>`;
      proxyGroupElement += `    <div class="text-neutral-900 dark:text-white text-sm">`;
      proxyGroupElement += `      <p>IP: ${proxyData.proxyIP}</p>`;
      proxyGroupElement += `      <p>Port: ${proxyData.proxyPort}</p>`;
      proxyGroupElement += `    </div>`;
      proxyGroupElement += `  </div>`;
      proxyGroupElement += `  <div class="flex flex-col gap-2 mt-3 text-sm">`;
      for (let x = 0; x < proxyData.list.length; x++) {
        const indexName = ["Trojan TLS", "VLESS TLS", "SS TLS", "Trojan NTLS", "VLESS NTLS", "SS NTLS"];
        const proxy = proxyData.list[x];

        if (x % 2 == 0) {
          proxyGroupElement += `<div class="flex gap-2 justify-around w-full">`;
        }

        proxyGroupElement += `<button class="bg-blue-500 dark:bg-neutral-800 dark:border-2 dark:border-blue-500 rounded p-1 w-full text-white" onclick="copyToClipboard('${proxy}')">${indexName[x]}</button>`;

        if (x % 2 == 1) {
          proxyGroupElement += `</div>`;
        }
      }
      proxyGroupElement += `  </div>`;
      proxyGroupElement += `</div>`;
    }
    proxyGroupElement += `</div>`;

    this.html = this.html.replaceAll("PLACEHOLDER_PROXY_GROUP", `${proxyGroupElement}`);
  }

  buildCountryFlag() {
    const proxyBankUrl = this.url.searchParams.get("proxy-list");
    const flagList = [];
    for (const proxy of cachedProxyList) {
      flagList.push(proxy.country);
    }

    let flagElement = "";
    for (const flag of new Set(flagList)) {
      flagElement += `<a href="/sub?cc=${flag}${
        proxyBankUrl ? "&proxy-list=" + proxyBankUrl : ""
      }" class="py-1" ><img width=20 src="https://installer.us.kg/circle-flags/flags/${flag.toLowerCase()}.svg" /></a>`;
    }

    this.html = this.html.replaceAll("PLACEHOLDER_BENDERA_NEGARA", flagElement);
  }

  addPageButton(text, link, isDisabled) {
    const pageButton = `<li><button ${
      isDisabled ? "disabled" : ""
    } class="px-3 py-1 bg-amber-400 border-2 border-neutral-800 rounded" onclick=navigateTo('${link}')>${text}</button></li>`;

    this.html = this.html.replaceAll("PLACEHOLDER_PAGE_BUTTON", `${pageButton}\nPLACEHOLDER_PAGE_BUTTON`);
  }

  build() {
    this.buildProxyGroup();
    this.buildCountryFlag();

    this.html = this.html.replaceAll("PLACEHOLDER_API_READY", isApiReady ? "block" : "hidden");

    return this.html.replaceAll(/PLACEHOLDER_\w+/gim, "");
  }
}
