import { connect } from "cloudflare:sockets";

// Variables
const rootDomain = "krikkrik.tech"; // Ganti dengan domain utama kalian
const serviceName = "nautica"; // Ganti dengan nama workers kalian
const apiKey = "7e2f6633ebebd677eff1a44d862e50d9238a4"; // Ganti dengan Global API key kalian (https://dash.cloudflare.com/profile/api-tokens)
const apiEmail = "paoandest@gmail.com"; // Ganti dengan email yang kalian gunakan
const accountID = "cc54feaa203598b999e944bfa6bbb30f"; // Ganti dengan Account ID kalian (https://dash.cloudflare.com -> Klik domain yang kalian gunakan)
const zoneID = "825bc64f18bd38765dd68bd412096aec"; // Ganti dengan Zone ID kalian (https://dash.cloudflare.com -> Klik domain yang kalian gunakan)
let isApiReady = false;
let proxyIP = "";
let cachedProxyList = [];

// Constant
const APP_DOMAIN = `${serviceName}.${rootDomain}`;
const PORTS = [443, 80];
const PROTOCOLS = [reverse("najort"), reverse("sselv"), reverse("ss")];
const KV_PROXY_URL = "https://raw.githubusercontent.com/jaka2m/Nautica/refs/heads/main/kvProxyList.json";
const PROXY_BANK_URL = "https://raw.githubusercontent.com/jaka2m/botak/refs/heads/main/cek/proxyList.txt";
const DNS_SERVER_ADDRESS = "8.8.8.8";
const DNS_SERVER_PORT = 53;
const PROXY_HEALTH_CHECK_API = "https://cobay.vercel.app/check";
const CONVERTER_URL = "https://api.foolvpn.me/convert";
const DONATE_LINK = "https://github.com/jaka1m/project/raw/main/BAYAR.jpg";
const TELEGRAM_USERNAME = "sampiiiiu";
const WHATSAPP_NUMBER = "6282339191527";
const BAD_WORDS_LIST =
  "https://gist.githubusercontent.com/adierebel/a69396d79b787b84d89b45002cb37cd6/raw/6df5f8728b18699496ad588b3953931078ab9cf1/kata-kasar.txt";
const PROXY_PER_PAGE = 8;
const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;
const CORS_HEADER_OPTIONS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const countryCodeMap = {
  "afghanistan": "AF",
  "aland islands": "AX",
  "albania": "AL",
  "algeria": "DZ",
  "american samoa": "AS",
  "andorra": "AD",
  "angola": "AO",
  "anguilla": "AI",
  "antarctica": "AQ",
  "antigua and barbuda": "AG",
  "argentina": "AR",
  "armenia": "AM",
  "aruba": "AW",
  "australia": "AU",
  "austria": "AT",
  "azerbaijan": "AZ",
  "bahamas": "BS",
  "bahrain": "BH",
  "bangladesh": "BD",
  "barbados": "BB",
  "belarus": "BY",
  "belgium": "BE",
  "belize": "BZ",
  "benin": "BJ",
  "bermuda": "BM",
  "bhutan": "BT",
  "bolivia": "BO",
  "bonaire, sint eustatius and saba": "BQ",
  "bosnia and herzegovina": "BA",
  "botswana": "BW",
  "bouvet island": "BV",
  "brazil": "BR",
  "british indian ocean territory": "IO",
  "brunei darussalam": "BN",
  "bulgaria": "BG",
  "burkina faso": "BF",
  "burundi": "BI",
  "cabo verde": "CV",
  "cambodia": "KH",
  "cameroon": "CM",
  "canada": "CA",
  "cayman islands": "KY",
  "central african republic": "CF",
  "chad": "TD",
  "chile": "CL",
  "china": "CN",
  "christmas island": "CX",
  "cocos (keeling) islands": "CC",
  "colombia": "CO",
  "comoros": "KM",
  "congo (democratic republic of the)": "CD",
  "congo": "CG",
  "cook islands": "CK",
  "costa rica": "CR",
  "cote d'ivoire": "CI",
  "croatia": "HR",
  "cuba": "CU",
  "curaçao": "CW",
  "cyprus": "CY",
  "czechia": "CZ",
  "denmark": "DK",
  "djibouti": "DJ",
  "dominica": "DM",
  "dominican republic": "DO",
  "ecuador": "EC",
  "egypt": "EG",
  "el salvador": "SV",
  "equatorial guinea": "GQ",
  "eritrea": "ER",
  "estonia": "EE",
  "eswatini": "SZ",
  "ethiopia": "ET",
  "falkland islands (malvinas)": "FK",
  "faroe islands": "FO",
  "fiji": "FJ",
  "finland": "FI",
  "france": "FR",
  "french guiana": "GF",
  "french polynesia": "PF",
  "french southern territories": "TF",
  "gabon": "GA",
  "gambia": "GM",
  "georgia": "GE",
  "germany": "DE",
  "ghana": "GH",
  "gibraltar": "GI",
  "greece": "GR",
  "greenland": "GL",
  "grenada": "GD",
  "guadeloupe": "GP",
  "guam": "GU",
  "guatemala": "GT",
  "guernsey": "GG",
  "guinea": "GN",
  "guinea-bissau": "GW",
  "guyana": "GY",
  "haiti": "HT",
  "heard island and mcdonald islands": "HM",
  "holy see": "VA",
  "honduras": "HN",
  "hong kong": "HK",
  "hungary": "HU",
  "iceland": "IS",
  "india": "IN",
  "indonesia": "ID",
  "iran (islamic republic of)": "IR",
  "iraq": "IQ",
  "ireland": "IE",
  "isle of man": "IM",
  "israel": "IL",
  "italy": "IT",
  "jamaica": "JM",
  "japan": "JP",
  "jersey": "JE",
  "jordan": "JO",
  "kazakhstan": "KZ",
  "kenya": "KE",
  "kiribati": "KI",
  "korea (democratic people's republic of)": "KP",
  "korea (republic of)": "KR",
  "kuwait": "KW",
  "kyrgyzstan": "KG",
  "lao people's democratic republic": "LA",
  "latvia": "LV",
  "lebanon": "LB",
  "lesotho": "LS",
  "liberia": "LR",
  "libya": "LY",
  "liechtenstein": "LI",
  "lithuania": "LT",
  "luxembourg": "LU",
  "macao": "MO",
  "madagascar": "MG",
  "malawi": "MW",
  "malaysia": "MY",
  "maldives": "MV",
  "mali": "ML",
  "malta": "MT",
  "marshall islands": "MH",
  "martinique": "MQ",
  "mauritania": "MR",
  "mauritius": "MU",
  "mayotte": "YT",
  "mexico": "MX",
  "micronesia (federated states of)": "FM",
  "moldova (republic of)": "MD",
  "monaco": "MC",
  "mongolia": "MN",
  "montenegro": "ME",
  "montserrat": "MS",
  "morocco": "MA",
  "mozambique": "MZ",
  "myanmar": "MM",
  "namibia": "NA",
  "nauru": "NR",
  "nepal": "NP",
  "netherlands": "NL",
  "new caledonia": "NC",
  "new zealand": "NZ",
  "nicaragua": "NI",
  "niger": "NE",
  "nigeria": "NG",
  "niue": "NU",
  "norfolk island": "NF",
  "northern mariana islands": "MP",
  "norway": "NO",
  "oman": "OM",
  "pakistan": "PK",
  "palau": "PW",
  "palestine, state of": "PS",
  "panama": "PA",
  "papua new guinea": "PG",
  "paraguay": "PY",
  "peru": "PE",
  "philippines": "PH",
  "pitcairn": "PN",
  "poland": "PL",
  "portugal": "PT",
  "puerto rico": "PR",
  "qatar": "QA",
  "republic of north macedonia": "MK",
  "romania": "RO",
  "russian federation": "RU",
  "rwanda": "RW",
  "réunion": "RE",
  "saint barthélemy": "BL",
  "saint helena, ascension and tristan da cunha": "SH",
  "saint kitts and nevis": "KN",
  "saint lucia": "LC",
  "saint martin (french part)": "MF",
  "saint pierre and miquelon": "PM",
  "saint vincent and the grenadines": "VC",
  "samoa": "WS",
  "san marino": "SM",
  "sao tome and principe": "ST",
  "saudi arabia": "SA",
  "senegal": "SN",
  "serbia": "RS",
  "seychelles": "SC",
  "sierra leone": "SL",
  "singapore": "SG",
  "sint maarten (dutch part)": "SX",
  "slovakia": "SK",
  "slovenia": "SI",
  "solomon islands": "SB",
  "somalia": "SO",
  "south africa": "ZA",
  "south georgia and the south sandwich islands": "GS",
  "south sudan": "SS",
  "spain": "ES",
  "sri lanka": "LK",
  "sudan": "SD",
  "suriname": "SR",
  "svalbard and jan mayen": "SJ",
  "sweden": "SE",
  "switzerland": "CH",
  "syrian arab republic": "SY",
  "taiwan (province of china)": "TW",
  "tajikistan": "TJ",
  "tanzania, united republic of": "TZ",
  "thailand": "TH",
  "timor-leste": "TL",
  "togo": "TG",
  "tokelau": "TK",
  "tonga": "TO",
  "trinidad and tobago": "TT",
  "tunisia": "TN",
  "turkey": "TR",
  "turkmenistan": "TM",
  "turks and caicos islands": "TC",
  "tuvalu": "TV",
  "uganda": "UG",
  "ukraine": "UA",
  "united arab emirates": "AE",
  "united kingdom of great britain and northern ireland": "GB",
  "united states of america": "US",
  "united states minor outlying islands": "UM",
  "uruguay": "UY",
  "uzbekistan": "UZ",
  "vanuatu": "VU",
  "venezuela (bolivarian republic of)": "VE",
  "viet nam": "VN",
  "virgin islands (british)": "VG",
  "virgin islands (u.s.)": "VI",
  "wallis and futuna": "WF",
  "western sahara": "EH",
  "yemen": "YE",
  "zambia": "ZM",
  "zimbabwe": "ZW"
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
  const startIndex = PROXY_PER_PAGE * page;

  try {
    const uuid = crypto.randomUUID();

    // Build URI
    const uri = new URL(`${reverse("najort")}://${hostName}`);
    uri.searchParams.set("encryption", "none");
    uri.searchParams.set("type", "ws");
    uri.searchParams.set("host", hostName);

    // Build HTML
    const document = new Document(request);
    document.setTitle("Free VPN <span class='text-blue-500 font-semibold'>Cloudflare</span>");
    document.addInfo(`Total: ${proxyList.length}`);
    document.addInfo(`Page: ${page}/${Math.floor(proxyList.length / PROXY_PER_PAGE)}`);
    document.setTotalProxy(proxyList.length);
    document.setPage(page, Math.floor(proxyList.length / PROXY_PER_PAGE));

    for (let i = startIndex; i < startIndex + PROXY_PER_PAGE; i++) {
      const proxy = proxyList[i];
      if (!proxy) break;

      const { proxyIP, proxyPort, country, org } = proxy;

      uri.searchParams.set("path", `/${proxyIP}-${proxyPort}`);

      const proxies = [];
      for (const port of PORTS) {
        uri.port = port.toString();
        uri.hash = `${i + 1} ${getFlagEmoji(country)} ${org} WS ${port == 443 ? "TLS" : "NTLS"} [${serviceName}]`;
        for (const protocol of PROTOCOLS) {
          // Special exceptions
          if (protocol === "ss") {
            uri.username = btoa(`none:${uuid}`);
            uri.searchParams.set(
              "plugin",
              `v2ray-plugin${
                port == 80 ? "" : ";tls"
              };mux=0;mode=websocket;path=/${proxyIP}-${proxyPort};host=${hostName}`
            );
          } else {
            uri.username = uuid;
            uri.searchParams.delete("plugin");
          }

          uri.protocol = protocol;
          uri.searchParams.set("security", port == 443 ? "tls" : "none");
          uri.searchParams.set("sni", port == 80 && protocol == reverse("sselv") ? "" : hostName);

          // Build VPN URI
          proxies.push(uri.toString());
        }
      }
      document.registerProxies(
        {
          proxyIP,
          proxyPort,
          country,
          org,
        },
        proxies
      );
    }

    // Build pagination
    document.addPageButton("Prev", `/sub/${page > 0 ? page - 1 : 0}`, page > 0 ? false : true);
    document.addPageButton("Next", `/sub/${page + 1}`, page < Math.floor(proxyList.length / 10) ? false : true);

    return document.build();
  } catch (error) {
    return `An error occurred while generating the ${reverse("SSELV")} configurations. ${error}`;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // --- Mulai penambahan kode di sini ---
      // Halaman HTML selamat datang
      if (url.pathname === "/") {
        const welcomeHtml = `
 <!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GEO-PROJECT || Home</title>
    
    <!-- Favicon -->
    <link rel="icon" href="https://raw.githubusercontent.com/jaka2m/mau/refs/heads/kepo/G.png" type="image/png">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
    :root {
  /* Light mode variables */
  --gray-dark: #334155;
  --accent-color: #ff6b6b;
  --dark-bg: #0f0c29;
  --dark-bg-gradient-1: #302b63;
  --dark-bg-gradient-2: #24243e;

  --background-color: #ffffff;
  --card-background: rgba(255, 255, 255, 0.9);
  --card-border: rgba(106, 17, 203, 0.1);
  --text-primary: #000000;
  --text-secondary: #333333;
  --text-muted: rgba(0, 0, 0, 0.5);
  --text-color: #111;

  --footer-background: rgba(255, 255, 255, 0.9);
  --footer-border: rgba(106, 17, 203, 0.1);
  --footer-shadow: rgba(0, 0, 0, 0.1);

  --primary-color: #32CD32; /* Green for light mode */
  --secondary-color: #00C853;
  --icon-background: rgba(255, 255, 255, 0.05);

  --success-color: #38ef7d;

  /* UI elements */
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-full: 9999px;

  /* Effects */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --glow-primary: 0 0 10px rgba(106, 17, 203, 0.5), 0 0 20px rgba(106, 17, 203, 0.2);
  --glow-secondary: 0 0 15px rgba(37, 117, 252, 0.5);
  --shadow-color: rgba(0, 0, 0, 0.1);

  /* Animations */
  --transition-normal: all 0.3s ease;
  --transition-slow: all 0.5s ease;
}

body.dark-mode {
  /* Dark mode overrides */
  --background-color: #0f0e20;
  --card-background: rgba(15, 14, 32, 0.8);
  --card-border: rgba(106, 17, 203, 0.1);
  --text-primary: #ffffff;
  --text-secondary: #dddddd;
  --text-muted: rgba(255, 255, 255, 0.5);
  --text-color: #fff;

  --footer-background: rgba(15, 14, 32, 0.8);
  --footer-border: rgba(106, 17, 203, 0.1);
  --footer-shadow: rgba(0, 0, 0, 0.3);

  --primary-color: #6a11cb; /* Purple for dark mode */
  --secondary-color: #2575fc;
  --icon-background: rgba(0, 0, 0, 0.1);

  --shadow-color: rgba(0, 0, 0, 0.5);
}

/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Rajdhani", sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--dark-bg), var(--dark-bg-gradient-1), var(--dark-bg-gradient-2));
  background-attachment: fixed;
  min-height: 100vh;
  position: relative;
}

body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 30%, rgba(106, 17, 203, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(37, 117, 252, 0.15) 0%, transparent 40%);
  z-index: -1;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
}

ul,
ol {
  list-style: none;
}

/* Navigation buttons */
.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.nav-button {
  background: rgba(106, 17, 203, 0.1);
  border: 1px solid rgba(106, 17, 203, 0.2);
  color: var(--text-secondary);
  font-weight: 500; /* Tambahkan ini */
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-button:hover {
  background: rgba(106, 17, 203, 0.2);
  color: var(--text-primary);
  font-weight: 600; /* Opsional, lebih tebal saat hover */
  transform: translateY(-2px);
  box-shadow: var(--glow-primary);
}

.nav-button.active {
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  box-shadow: var(--glow-primary);
}

.nav-highlight {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  padding: 5px 12px;
  border-radius: 20px;
  color: white !important;
  box-shadow: 0 3px 10px rgba(106, 17, 203, 0.3);
}

.nav-highlight:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(106, 17, 203, 0.4);
}

.nav-highlight::after {
  display: none;
}

/* Donation modal */
.donation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
}

.donation-modal.active {
  opacity: 1;
  visibility: visible;
}

.donation-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}

.donation-content {
  position: relative;
  background: linear-gradient(to bottom right, #1e1e3f, #0f0c29);
  border-radius: var(--border-radius-lg);
  padding: 1px;
  max-width: 90%;
  width: 400px;
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.donation-modal.active .donation-content {
  transform: scale(1);
}

.donation-border {
  position: absolute;
  inset: 0;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.donation-border-animation {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color), var(--primary-color));
  animation: rotate 8s linear infinite;
  opacity: 0.7;
}

.donation-body {
  position: relative;
  background: var(--dark-bg);
  border-radius: calc(var(--border-radius-lg) - 1px);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-donation {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-full);
  transition: var(--transition-normal);
}

.close-donation:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.donation-title {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  text-align: center;
}

.donation-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 20px;
  text-align: center;
}

.donation-small-text {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: 16px;
  text-align: center;
}

.qris-container {
  position: relative;
  padding: 3px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.qris-border {
  position: absolute;
  inset: 0;
}

.qris-border-animation {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color), var(--primary-color));
  animation: pulse 2s infinite;
  opacity: 0.7;
  border-radius: var(--border-radius-md);
}

.qris-image-container {
  position: relative;
  background: white;
  padding: 10px;
  border-radius: calc(var(--border-radius-md) - 2px);
}

.qris-image {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Animations */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .nav-buttons {
    gap: 8px;
  }

  .nav-button {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .nav-highlight {
    margin-top: 10px;
    display: inline-block;
  }
}

@media (max-width: 480px) {
  .donation-content {
    width: 90%;
  }

  .btn {
    padding: 8px 16px;
    font-size: 0.8rem;
  }

  .nav-buttons {
    gap: 5px;
  }

  .nav-button {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}

/* Current year script support */
#current-year {
  display: inline;
}

/* Floating Donation Button */
.donate-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 5px 20px rgba(106, 17, 203, 0.5);
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  animation: pulse-donate 2s infinite;
}

@keyframes pulse-donate {
  0% {
    box-shadow: 0 0 0 0 rgba(106, 17, 203, 0.7);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(106, 17, 203, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(106, 17, 203, 0);
    transform: scale(1);
  }
}

.donate-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .donate-btn {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .nav-buttons {
    gap: 5px;
  }

  .nav-button {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}

        /* Page-specific styles */
        body {
            font-family: "Rajdhani", sans-serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-attachment: fixed;
            position: relative;
            overflow-x: hidden;
            padding: 1rem 0;
        }
        
        .container {
    width: 100%;
    max-width: 480px;
    padding: 0 0.75rem;
    margin-bottom: 1rem;
}

.card {
    background: var(--card-background);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 10px 25px var(--shadow-color);
    position: relative;
    overflow: hidden;
    border: 1px solid var(--card-border);
    width: 100%;
}

.card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color));
}

.card::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, rgba(106, 17, 203, 0.5), rgba(37, 117, 252, 0.5), rgba(255, 107, 107, 0.5));
    filter: blur(1px);
}

        .title-container {
            text-align: center;
            margin-bottom: 1.5rem;
            position: relative;
        }
        
        .title {
            font-family: "Orbitron", sans-serif;
            font-weight: 700;
            font-size: 1.8rem;
            letter-spacing: 1px;
            margin: 0;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
            display: inline-block;
        }
        
        .title::after {
            content: "HOME";
            position: absolute;
            top: -8px;
            right: -30px;
            font-size: 0.7rem;
            font-weight: 400;
            background: var(--accent-color);
            color: var(--dark-bg);
            padding: 2px 5px;
            border-radius: 3px;
            -webkit-text-fill-color: var(--dark-bg);
            transform: rotate(15deg);
        }
        
        .subtitle {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-top: 0.3rem;
        }
        
        .profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

        /* Wrapper mengikuti ukuran gambar */
.profile-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

/* Gambar profil */
.profile-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid transparent;
  background: linear-gradient(145deg, var(--primary-color), var(--secondary-color)) border-box;
  box-shadow: 0 0 20px rgba(106, 17, 203, 0.5);
  margin-bottom: 1rem;
  transition: width 0.3s ease, height 0.3s ease;
}

/* Overlay hover */
.change-photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s ease;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.profile-wrapper:hover .change-photo-overlay {
  opacity: 1;
}

#uploadInput {
  display: none;
}

/* RESPONSIVE DESIGN */
@media (max-width: 600px) {
  .profile-wrapper,
  .profile-img {
    width: 90px;
    height: 90px;
  }

  .change-photo-overlay {
    font-size: 12px;
    padding: 8px;
  }
}

@media (min-width: 1024px) {
  .profile-wrapper,
  .profile-img {
    width: 160px;
    height: 160px;
  }

  .change-photo-overlay {
    font-size: 16px;
    padding: 12px;
  }
}

        .status-badge {
            background: linear-gradient(45deg, #11998e, #38ef7d);
            color: white;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin: 1rem 0;
            box-shadow: 0 5px 15px rgba(56, 239, 125, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .status-badge i {
            font-size: 0.8rem;
            animation: blink 2s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .protocols {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin: 1.5rem 0;
    flex-wrap: wrap;
}

.protocol {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.protocol-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--icon-background);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 1.5rem;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;

    /* Lingkaran biru tipis */
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
}

        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 1.5rem;
        }
        
        .action-btn {
            width: 100%;
            padding: 0.8rem;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            border-radius: 8px;
            font-family: "Orbitron", sans-serif;
            font-weight: 600;
            font-size: 1rem;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            text-align: center;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .action-btn::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: 0.5s;
        }
        
        .action-btn:hover::before {
            left: 100%;
        }
        
        .action-btn:hover {
            box-shadow: var(--glow-primary);
            transform: translateY(-2px);
        }
        
        .tech-detail {
            position: absolute;
            background: var(--primary-color);
            opacity: 0.1;
            z-index: -1;
        }
        
        .tech-detail-1 {
            width: 40px;
            height: 40px;
            top: 20px;
            right: 20px;
            border-radius: 50%;
            box-shadow: 0 0 20px var(--primary-color);
        }
        
        .tech-detail-2 {
            width: 80px;
            height: 2px;
            bottom: 40px;
            left: -20px;
            transform: rotate(45deg);
        }
        
        .tech-detail-3 {
            width: 15px;
            height: 15px;
            bottom: 20px;
            right: 40px;
            transform: rotate(45deg);
        }
        
        
        .circuit-line {
            position: absolute;
            background: var(--primary-color);
            opacity: 0.1;
        }
        
        .circuit-line-1 {
            width: 60px;
            height: 1px;
            top: 20px;
            left: 20px;
        }
        
        .circuit-line-2 {
            width: 1px;
            height: 30px;
            top: 20px;
            left: 20px;
        }
        
        .circuit-line-3 {
            width: 40px;
            height: 1px;
            bottom: 25px;
            right: 30px;
        }
        
        .circuit-line-4 {
            width: 1px;
            height: 25px;
            bottom: 25px;
            right: 30px;
        }
        
        .circuit-dot {
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: var(--primary-color);
            opacity: 0.2;
        }
        
        .circuit-dot-1 {
            top: 20px;
            left: 20px;
        }
        
        .circuit-dot-2 {
            top: 50px;
            left: 20px;
        }
        
        .circuit-dot-3 {
            bottom: 25px;
            right: 30px;
        }
        
        .circuit-dot-4 {
            bottom: 50px;
            right: 30px;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 0 0.5rem;
            }
            
            .title {
                font-size: 1.5rem;
            }
            
            .subtitle {
                font-size: 0.8rem;
            }
            
            .profile-img {
                width: 100px;
                height: 100px;
            }
            
            .protocol-icon {
                width: 40px;
                height: 40px;
                font-size: 1.2rem;
            }
            
            .protocol-name {
                font-size: 0.8rem;
            }
            
            .action-btn {
                font-size: 0.9rem;
                padding: 0.7rem;
            }
        }
        
   #toggleModeBtn {
  position: fixed;
  bottom: 30px;
  left: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 5px 20px rgba(106, 17, 203, 0.5);
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  animation: pulse-donate 2s infinite;
}

@keyframes pulse-donate {
  0% {
    box-shadow: 0 0 0 0 rgba(106, 17, 203, 0.7);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(106, 17, 203, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(106, 17, 203, 0);
    transform: scale(1);
  }
}

#toggleModeBtn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  #toggleModeBtn {
    bottom: 20px;
    left: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

  /* Footer styles */
.footer {
    width: 100%;
    max-width: 480px;
    background: var(--footer-background);
    border-radius: 12px;
    padding: 1.2rem;
    position: relative;
    border: 1px solid var(--footer-border);
    box-shadow: 0 10px 25px var(--footer-shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    overflow: hidden;
    margin: 0 0.75rem;
    color: var(--text-color);
}

.footer::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color));
}

.footer::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, rgba(106, 17, 203, 0.5), rgba(37, 117, 252, 0.5), rgba(255, 107, 107, 0.5));
    filter: blur(1px);
}

.footer-logo {
    font-family: "Orbitron", sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    display: inline-block;
}

.footer-powered {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.6rem;
    font-family: "Share Tech Mono", monospace;
}

.footer-social {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    margin-bottom: 0.6rem;
    flex-wrap: wrap;
}

.social-icon {
    width: 14px;
    height: 14px;
}

.social-link {
            color: var(--primary-color);
            text-decoration: none;
            font-family: "Share Tech Mono", monospace;
            font-size: 0.8rem;
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            background: rgba(106, 17, 203, 0.05);
            border: 1px solid rgba(106, 17, 203, 0.1);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }
        
        .social-link:hover {
            background: rgba(106, 17, 203, 0.1);
            box-shadow: var(--glow-primary);
            transform: translateY(-2px);
        }
        
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="tech-detail tech-detail-1"></div>
            <div class="tech-detail tech-detail-2"></div>
            <div class="tech-detail tech-detail-3"></div>
            
            <div class="title-container">
                <h1 class="title">GEO - PROJECT</h1>
                <p class="subtitle">Free VPN Cloudflare</p>
            </div>
            
            <div class="nav-buttons">
                <a href="/" class="nav-button active">
                    <i class="fas fa-home"></i> Home
                </a>
                <a href="sub" class="nav-button">
                    <i class="fas fa-rss"></i> Menu
                </a>
                </div>
            
            <div class="profile-container">
  <div class="profile-wrapper">
    <img id="profileImage" src="https://raw.githubusercontent.com/jaka2m/mau/refs/heads/kepo/a.png" alt="Foto Profil" class="profile-img">
    <div class="change-photo-overlay" onclick="document.getElementById('uploadInput').click();">Ganti Foto</div>
  
  <input type="file" id="uploadInput" accept="image/*">
</div>
<br>

                <div class="status-badge">
                    <i class="fas fa-circle"></i> Layanan Aktif
                </div>
            </div>
            <br>
            <div class="protocols">
                <div class="protocol">
                    <div class="protocol-icon">
                        <i class="fas fa-atom"></i>
                    </div>
                    <span class="protocol-name">VLESS</span>
                </div>
                <div class="protocol">
                    <div class="protocol-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <span class="protocol-name">TROJAN</span>
                </div>
                <div class="protocol">
                    <div class="protocol-icon">
                        <i class="fas fa-ghost"></i>
                    </div>
                    <span class="protocol-name">SHADOW</span>
                </div>
            
    <footer class="footer">
        <div class="circuit-line circuit-line-1"></div>
        <div class="circuit-line circuit-line-2"></div>
        <div class="circuit-line circuit-line-3"></div>
        <div class="circuit-line circuit-line-4"></div>
        <div class="circuit-dot circuit-dot-1"></div>
        <div class="circuit-dot circuit-dot-2"></div>
        <div class="circuit-dot circuit-dot-3"></div>
        <div class="circuit-dot circuit-dot-4"></div>
        
        <div class="footer-logo">GEO-PROJECT</div>
        <div class="footer-powered">POWERED BY SECURE TECHNOLOGY</div>
        <div class="footer-social">
            <a href="https://t.me/sampiiiiu" class="social-link" target="_blank">
                <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.846 1.467 1.618 2.796 2.503 4.532.545 1.062 1.587 2.739 3.19 2.756 1.26.033 2.052-.6 3.542-1.95a142.91 142.91 0 0 1 2.43-2.053c1.686-.142 3.382-.284 5.12-.436.887-.075 1.92-.262 2.405-1.226.436-.877-.015-1.35-.48-1.874l-3.881-4.369-5.481-6.174S22.185 2.128 21.198 2.433z"></path>
                    <path d="M18.167 7.068c.237 1.632-1.162 6.872-1.766 8.849"></path>
                </svg>
                @sampiiiiu
            </a>
        </div>
    </footer>
    
    <div id="donation-button" class="donate-btn">
        <i class="fas fa-hand-holding-heart"></i>
    </div>
    
    <!-- Donation Modal -->
    <div id="donation-modal" class="donation-modal">
        <div class="donation-backdrop" id="donation-backdrop"></div>
        <div class="donation-content" id="donation-content">
            <!-- Animated border -->
            <div class="donation-border">
                <div class="donation-border-animation"></div>
            </div>
            
            <div class="donation-body">
                <button id="close-donation" class="close-donation">
                    <i class="fas fa-times"></i>
                </button>
                
                <h3 class="donation-title">Support Geo-Project</h3>
                <p class="donation-text">Your donation helps keep our services running</p>
                
                <div class="qris-container">
                    <!-- Inner animated border -->
                    <div class="qris-border">
                        <div class="qris-border-animation"></div>
                    </div>
                    <div class="qris-image-container">
                        <img src="https://raw.githubusercontent.com/jaka2m/vpn-cf/refs/heads/master/web/qris.png" alt="Donation QR Code" class="qris-image">
                    </div>
                </div>
                
                <p class="donation-small-text">Scan this QR code with your payment app to donate</p>
            </div>
        </div>
    </div>
    <button id="toggleModeBtn" onclick="toggleMode()" title="Toggle Mode">
  <i id="modeIcon" class="fas fa-sun"></i>
</button>

<script>
  function toggleMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateIcon(isDark);
  }

  function updateIcon(isDark) {
    const icon = document.getElementById('modeIcon');
    icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  }

  // Load saved mode and update icon
  window.addEventListener('DOMContentLoaded', () => {
    let saved = localStorage.getItem('theme');

    // Set default to dark if not set
    if (!saved) {
      saved = 'dark';
      localStorage.setItem('theme', 'dark');
    }

    const isDark = saved === 'dark';
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
    updateIcon(isDark);
  });
</script>
<script>
    	const profileImage = document.getElementById('profileImage');
  const uploadInput = document.getElementById('uploadInput');

  // Load image from localStorage if exists
  const storedImage = localStorage.getItem('profileImage');
  if (storedImage) {
    profileImage.src = storedImage;
  }

  uploadInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profileImage.src = e.target.result;
        localStorage.setItem('profileImage', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
  
        document.addEventListener('DOMContentLoaded', () => {
  const currentYearElements = document.querySelectorAll("#current-year");
  const currentYear = new Date().getFullYear();
  currentYearElements.forEach(element => {
    element.textContent = currentYear;
  });
});

 </script>
    <script>
        document.addEventListener("DOMContentLoaded", () => {
  const donationButton = document.getElementById("donation-button");
  const donationModal = document.getElementById('donation-modal');
  const closeDonationButton = document.getElementById("close-donation");
  const donationBackdrop = document.getElementById("donation-backdrop");

  if (donationButton && donationModal) {
    donationButton.addEventListener('click', () => {
      donationModal.classList.add("active");
    });

    if (closeDonationButton) {
      closeDonationButton.addEventListener("click", () => {
        donationModal.classList.remove("active");
      });
    }

    if (donationBackdrop) {
      donationBackdrop.addEventListener("click", () => {
        donationModal.classList.remove("active");
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === "Escape" && donationModal.classList.contains("active")) {
        donationModal.classList.remove("active");
      }
    });
  }
});
    </script>
</body>
</html>
        `;

        return new Response(welcomeHtml, {
          headers: {
            "Content-Type": "text/html",
          },
        });
      }
      // --- Akhir penambahan kode ---

      const upgradeHeader = request.headers.get("Upgrade");

      // Gateway check
      if (apiKey && apiEmail && accountID && zoneID) {
        isApiReady = true;
      }

      // Handle proxy client
      if (upgradeHeader === "websocket") {
        const proxyMatch = url.pathname.match(/^\/(.+[:=-]\d+)$/);

        if (url.pathname.length == 3 || url.pathname.match(",")) {
          // Contoh: /ID, /SG, dll
          const proxyKeys = url.pathname.replace("/", "").toUpperCase().split(",");
          const proxyKey = proxyKeys[Math.floor(Math.random() * proxyKeys.length)];
          const kvProxy = await getKVProxyList();

          proxyIP = kvProxy[proxyKey][Math.floor(Math.random() * kvProxy[proxyKey].length)];

          return await websocketHandler(request);
        } else if (proxyMatch) {
          proxyIP = proxyMatch[1];
          return await websocketHandler(request);
        }
      }

      if (url.pathname.startsWith("/sub")) {
        const page = url.pathname.match(/^\/sub\/(\d+)$/);
        const pageIndex = parseInt(page ? page[1] : "0");
        const hostname = request.headers.get("Host");

        // Queries
        const countrySelectRaw = url.searchParams.get("cc")?.split(",");
        let countrySelect = [];

        if (countrySelectRaw) {
          countrySelect = countrySelectRaw.map(cc => {
            const normalizedCc = cc.toLowerCase().trim();
            return countryCodeMap[normalizedCc] || cc.toUpperCase().trim();
          });
        }
        
        const proxyBankUrl = url.searchParams.get("proxy-list") || env.PROXY_BANK_URL;
        let proxyList = (await getProxyList(proxyBankUrl)).filter((proxy) => {
          // Filter proxies by Country
          if (countrySelect.length > 0) {
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
          const filterCCRaw = url.searchParams.get("cc")?.split(",") || [];
          let filterCC = [];

          if (filterCCRaw.length > 0) {
            filterCC = filterCCRaw.map(cc => {
              const normalizedCc = cc.toLowerCase().trim();
              return countryCodeMap[normalizedCc] || cc.toUpperCase().trim();
            });
          }

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
            const uri = new URL(`${reverse("najort")}://${fillerDomain}`);
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
                  uri.searchParams.set(
                    "plugin",
                    `v2ray-plugin${port == 80 ? "" : ";tls"};mux=0;mode=websocket;path=/${proxy.proxyIP}-${
                      proxy.proxyPort
                    };host=${APP_DOMAIN}`
                  );
                } else {
                  uri.username = uuid;
                }

                uri.searchParams.set("security", port == 443 ? "tls" : "none");
                uri.searchParams.set("sni", port == 80 && protocol == reverse("sselv") ? "" : APP_DOMAIN);
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
            case "v2ray":
              finalResult = btoa(result.join("\n"));
              break;
            case "clash":
            case "sfa":
            case "bfr":
              const res = await fetch(CONVERTER_URL, {
                method: "POST",
                body: JSON.stringify({
                  url: result.join(","),
                  format: filterFormat,
                  template: "cf",
                }),
              });
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

          if (protocol === reverse("najorT")) {
            protocolHeader = parseNajortHeader(chunk);
          } else if (protocol === reverse("SSELV")) {
            protocolHeader = parseSselvHeader(chunk);
          } else if (protocol === reverse("skcoswodahS")) {
            protocolHeader = parseSsHeader(chunk);
          } else {
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
    const najortDelimiter = new Uint8Array(buffer.slice(56, 60));
    if (najortDelimiter[0] === 0x0d && najortDelimiter[1] === 0x0a) {
      if (najortDelimiter[2] === 0x01 || najortDelimiter[2] === 0x03 || najortDelimiter[2] === 0x7f) {
        if (najortDelimiter[3] === 0x01 || najortDelimiter[3] === 0x03 || najortDelimiter[3] === 0x04) {
          return reverse("najorT");
        }
      }
    }
  }

  const sselvDelimiter = new Uint8Array(buffer.slice(1, 17));
  // Hanya mendukung UUID v4
  if (arrayBufferToHex(sselvDelimiter).match(/^[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}[89ab][0-9a-f]{3}[0-9a-f]{12}$/i)) {
    return reverse("SSELV");
  }

  return reverse("skcoswodahS"); // default
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

function parseSsHeader(ssBuffer) {
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
        message: `Invalid addressType for ${reverse("skcoswodahS")}: ${addressType}`,
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

function parseSselvHeader(buffer) {
  const version = new Uint8Array(buffer.slice(0, 1));
  let isUDP = false;

  const optLength = new Uint8Array(buffer.slice(17, 18))[0];

  const cmd = new Uint8Array(buffer.slice(18 + optLength, 18 + optLength + 1))[0];
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
  const portBuffer = buffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);

  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(buffer.slice(addressIndex, addressIndex + 1));

  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1: // For IPv4
      addressLength = 4;
      addressValue = new Uint8Array(buffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 2: // For Domain
      addressLength = new Uint8Array(buffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(buffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3: // For IPv6
      addressLength = 16;
      const dataView = new DataView(buffer.slice(addressValueIndex, addressValueIndex + addressLength));
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
    rawClientData: buffer.slice(addressValueIndex + addressLength),
    version: new Uint8Array([version[0], 0]),
    isUDP: isUDP,
  };
}

function parseNajortHeader(buffer) {
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

function reverse(s) {
  return s.split("").reverse().join("");
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
      if (domainTest.status == 530) return domainTest.status;

      const badWordsListRes = await fetch(BAD_WORDS_LIST);
      if (badWordsListRes.status == 200) {
        const badWordsList = (await badWordsListRes.text()).split("\n");
        for (const badWord of badWordsList) {
          if (domain.includes(badWord.toLowerCase())) {
            return 403;
          }
        }
      } else {
        return 403;
      }
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


let baseHTML = `
<!DOCTYPE html>
<html lang="en" id="html" class="scroll-auto scrollbar-hide dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Geo-VPN | VPN Tunnel | CloudFlare</title>

    <meta name="description" content="Akun Vless Gratis. Geo-VPN offers free Vless accounts with Cloudflare and Trojan support. Secure and fast VPN tunnel services.">
    <meta name="keywords" content="Geo-VPN, Free Vless, Vless CF, Trojan CF, Cloudflare, VPN Tunnel, Akun Vless Gratis">
    <meta name="author" content="Geo-VPN">
    <meta name="robots" content="index, follow, noarchive, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

    <link rel="icon" href="https://geoproject.biz.id/circle-flags/bote.png">
    <link rel="apple-touch-icon" href="https://geoproject.biz.id/circle-flags/bote.png">

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js"></script>
    
    <style>
        /* For Webkit-based browsers (Chrome, Safari and Opera) */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        /* For IE, Edge and Firefox */
        .scrollbar-hide {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        /* Glassmorphism Effect */
        .glass-effect {
            background-color: rgba(42, 42, 47, 0.6);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 224, 183, 0.3);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .glass-effect-light {
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(0, 224, 183, 0.2);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        /* CSS untuk animasi bendera berputar */
.flag-spin {
  animation: spin-around 4s linear infinite alternate; /* 4s: durasi, infinite: berulang, alternate: bolak-balik */
  transform-origin: center center; /* Pastikan rotasi dari tengah */
}

@keyframes spin-around {
  0% {
    transform: rotateY(0deg); /* Posisi awal, tidak berputar */
  }
  50% {
    transform: rotateY(180deg); /* Berputar 180 derajat (menghadap ke belakang) */
  }
  100% {
    transform: rotateY(0deg); /* Kembali ke posisi awal (menghadap ke depan) */
  }
}
    </style>

    <script>
        tailwind.config = {
            darkMode: 'selector',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Poppins', 'sans-serif'],
                    },
                    colors: {
                        'primary-dark': '#1c1c20',
                        'secondary-dark': '#2a2a2f',
                        'text-light': '#f0f0f5',
                        'accent-cyan': '#00e0b7',
                        'accent-blue': '#4a90e2',
                    },
                },
            },
        };
    </script>
</head>
<body
    class="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-white bg-fixed transition-colors duration-300"
  >
    <div
      id="loading-screen"
      class="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-80 transition-opacity duration-500"
    >
      <div
        class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400"
      ></div>
    </div>

    <div id="notification-badge" class="fixed z-50 opacity-0 transition-opacity ease-in-out duration-300 mt-9 mr-6 right-0 p-4 max-w-sm rounded-xl flex items-center gap-x-4 shadow-lg glass-effect dark:glass-effect-light">
        <div class="shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 text-accent-cyan">
                <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
                <path fill-rule="evenodd" d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z" clip-rule="evenodd" />
            </svg>
        </div>
        <div>
            <div class="text-md font-bold text-accent-cyan">Berhasil!</div>
            <p class="text-sm text-gray-300">Akun berhasil disalin</p>
        </div>
    </div>

    <!-- Select Country -->
    <div>
      <div
        class="h-full fixed top-0 w-14 bg-gray-100 dark:bg-gray-900 border-r-2 border-gray-300 dark:border-gray-700 z-20 overflow-y-scroll scrollbar-hide"
      >
        <div class="text-2xl flex flex-col items-center h-full gap-2 py-2">
          PLACEHOLDER_BENDERA_NEGARA
        </div>
      </div>
    </div>
    
    <div class="ml-16 flex flex-col items-center min-h-screen relative z-10 p-4">
  <div class="glass-effect-light dark:glass-effect w-full mb-6 rounded-xl p-4 shadow-lg">
    <div class="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">

      <p id="container-info-ip" class="flex items-center gap-1 text-blue-500 dark:text-blue-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.5 13a4.5 4.5 0 011.692-3.377l1.72-1.725A4.5 4.5 0 0113 5.5V6a.5.5 0 001 0V5.5A4.5 4.5 0 009.377 2.308L7.653 4.032A4.5 4.5 0 005 8.5v.5a.5.5 0 001 0V8.5A3.5 3.5 0 017.377 5.79l.995.996a.5.5 0 00.707-.707l-.996-.995A4.5 4.5 0 008.5 2.5a.5.5 0 000-1z" />
        </svg>
        IP: <span class="font-bold text-slate-800 dark:text-white">127.0.0.1</span>
      </p>
      <p id="container-info-country" class="flex items-center gap-1 text-green-500 dark:text-green-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 3.126A8.024 8.024 0 0110 3a8 8 0 01.445.126l.01.004.013.006.015.008A5.96 5.96 0 0014 9a6 6 0 01-5.995 5.986L9 15a6 6 0 01-5.986-5.995l-.004-.01-.006-.013A6.024 6.024 0 013 10a8.024 8.024 0 01.126-.445l.004-.01.006-.013.008-.015A5.96 5.96 0 009 6a6 6 0 015.995 5.986L15 12a6 6 0 01-5.986 5.995l-.01-.004-.013-.006-.015-.008A6.024 6.024 0 019 18z" clip-rule="evenodd" />
        </svg>
        Country: <span class="font-bold text-slate-800 dark:text-white">Singapore</span>
      </p>
      <p id="container-info-isp" class="flex items-center gap-1 text-indigo-500 dark:text-indigo-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3a7 7 0 00-7 7h1.5a5.5 5.5 0 1111 0h1.5a7 7 0 00-7-7z" />
        </svg>
        ISP: <span class="font-bold text-slate-800 dark:text-white">Localhost</span>
      </p>

      <p class="flex items-center gap-1 text-purple-500 dark:text-purple-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm13 2H4v10h12V5z" />
        </svg>
        <span class="text-gray-600 dark:text-gray-300">Total Proxy: <strong id="total-proxy-value" class="font-semibold">0</strong></span>
      </p>
      <p class="flex items-center gap-1 text-orange-500 dark:text-orange-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 2a1 1 0 00-1 1v4a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1H5zm1 2h2v2H6v-2zm4 0h2v2h-2v-2z" clip-rule="evenodd" />
        </svg>
        <span class="text-gray-600 dark:text-gray-300">Page: <strong id="page-info-value" class="font-semibold">0/0</strong></span>
      </p>
      <p class="flex items-center gap-1 text-teal-500 dark:text-teal-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        Time: <strong id="time-info-value" class="font-semibold text-slate-800 dark:text-white">00:00:00</strong>
      </p>
    </div>
  </div>

  <div id="container-title" class="sticky top-0 z-10 w-full max-w-7xl rounded-xl py-6 text-center shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out">
  <div class="relative overflow-hidden">
    <h1 id="runningTitle" class="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
      PLACEHOLDER_JUDUL
    </h1>
  </div>
</div>

        <div class="flex flex-col md:flex-row gap-4 pt-8 w-full max-w-7xl justify-center">
    PLACEHOLDER_PROXY_GROUP
</div>

        <!-- Pagination -->
        <nav id="container-pagination" class="w-full max-w-7xl mt-8 sticky bottom-0 z-20 transition-transform -translate-y-6">
            <ul class="flex justify-center space-x-4">
                PLACEHOLDER_PAGE_BUTTON
            </ul>
        </nav>
    </div>

    <div id="container-window" class="hidden">
  <div class="fixed z-20 top-0 inset-0 w-full h-full bg-gray-900/80 backdrop-blur-sm flex justify-center items-center animate-fade-in">
    <p id="container-window-info" class="text-center w-full h-full top-1/4 absolute text-white animate-pulse"></p>
  </div>

  <div id="output-window" class="fixed z-30 inset-0 flex justify-center items-center p-2 hidden">
    <div class="w-full max-w-xs flex flex-col gap-2 p-4 text-center rounded-xl bg-gray-800 border border-gray-700 shadow-lg animate-zoom-in">

      <div class="flex flex-col items-center gap-1 mb-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="size-8 text-indigo-500">
          <path d="M47.6 32.1C18.6 37.9 0 69.8 0 102.3V410.6c0 32.5 18.6 64.4 47.6 70.3L235.7 512c2.4 .5 4.8 .5 7.2 0L464.4 480.9c29-5.9 47.6-37.8 47.6-70.3V102.3c0-32.5-18.6-64.4-47.6-70.3L242.9 0c-2.4-.5-4.8-.5-7.2 0L47.6 32.1zM256 160c-28.5 0-56.1 4-82.4 12c-7.9 2.4-16.1-1.3-20.7-8.7c-4.6-7.4-4.5-16.3 .2-23.6l33.8-54c3.4-5.5 10.5-7.8 17.2-5.1l54.3 22c7.8 3.2 16.5-1.5 19.3-9.5c.3-.8 1.1-2.9 1.1-3.1c11.6-34 40.2-59.5 76-72.2c8.9-3.2 18.5-.7 25.1 6.8c12.5 14.2 18.2 33.1 16.3 52.8c-1.6 17.5-13 32.5-29 41.5l-6.3 3.6c-1.3 .7-2.3 2-2.7 3.5s-.3 3.1 .7 4.2l30 35.8c6.9 8.2 17.7 12.3 28.5 10.2l20.4-3.9c12.9-2.5 26.2 2.6 34.6 13.1c13.7 17.1 19.4 39.7 17.1 62.3c-2.2 22.7-13.6 42.1-31.5 54.1c-17.9 12-40.4 17.4-62.7 14.4c-25.2-3.4-47.8-15.5-65.7-33.3c-1.5-1.5-3.1-2.4-5.1-2.7s-4.1 .5-5.5 2L159.2 344c-3.1 4.1-3.6 9.6-1.5 14.1l43.2 92.4c3.7 7.9 12.4 11.2 20.7 8.1l42.6-16.2c4.7-1.8 9.9 0 13.5 4l50.8 55.4c4.3 4.7 6.4 10.7 5.7 16.7c-2.2 20.3-17.8 36.3-37.4 42.1c-16.6 4.9-34.6 1.7-49.2-8.5c-4.9-3.4-11.2-4.2-16.8-2l-151 56.6c-9.1 3.4-18.7 5.2-28.4 5.2c-56 0-101.9-45.9-101.9-101.9V125.6c0-2.8 .3-5.6 .8-8.3l10.5-56.1c1.9-10.1 10.1-17.5 20.2-17.5h.5z"/>
        </svg>
        <h4 class="text-xl font-bold text-white mt-1">Pilih Format</h4>
        </div>

      <div class="grid grid-cols-2 gap-2">
        <button onclick="copyToClipboardAsTarget('clash')" class="p-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-sm font-semibold text-white flex flex-col justify-center items-center transition-transform transform hover:scale-105 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" class="size-6 mb-1"><path d="M479.9 32.1C479.9 14.46 465.4 0 448 0H192c-17.47 0-32.22 14.46-31.99 31.99L160 384c0 17.46 14.46 32 32 32h128l-32.99 95.82c-4.141 12.19 2.594 25.75 14.78 29.89C304.8 512.9 308.8 512 312.4 512c8.203 0 16.28-4.484 20.78-12.14l128-224C474.7 269.8 480 263.2 480 256v-224C480 29.8 479.9 32.1 479.9 32.1zM384 256L272 448l64.01-192.1c.1406-.4375 .2812-.875 .4375-1.312L384 256z"/></svg>
          Clash
        </button>
        <button onclick="copyToClipboardAsTarget('sfa')" class="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold text-white flex flex-col justify-center items-center transition-transform transform hover:scale-105 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="size-6 mb-1"><path d="M576 128c0-35.3-28.7-64-64-64h-38.3c-1.6 4.6-3.7 9-6.4 13.1l-10.4 15.6c-20.7 31.1-55.1 52.4-94.8 55.9c-29.5 2.6-58.8-3.4-86.3-17.8c-23.7-12.2-46.3-25.9-63.5-39.7c-5.9-4.7-12.8-8-20.3-9.9L160.8 64H112C76.75 64 48 92.75 48 128c0 35.25 28.75 64 64 64H172.5c20.3-10.8 42.6-17.7 65.5-20.5c10.5-1.2 21.1-1.7 31.8-1.7c-11 5.9-21.4 13.5-30.8 22.8c-20.6 20.5-35.3 45.4-42.5 73.6c-1.3 5.3-2 10.9-2 16.6c0 10.6 2 20.9 6.2 30.6c3.2 7.6 7.6 15 13 22.1c25.4 33.3 59 55 96.6 63.8c-1.6 2.1-3.2 4.1-4.9 6.1c-14.7 17.5-30.7 33.2-47.5 46.9c-7.9 6.5-16.1 12.3-24.6 17.2c-29.1 16.9-59.5 28.7-90.9 35.3c-11.6 2.5-23.3 3.8-35 3.8h-48.4c-12.3 0-24.2-4.1-34.6-11.5L5.6 422.3c-13.8-10.1-2.9-31.2 14.8-28.7c18.5 2.6 37.1 3.9 55.7 3.9c25.3 0 50.8-3.4 75.8-10.3c15.2-4.3 30.1-9.9 44.5-16.9c13.7-6.7 26.9-14.7 39.5-24.1c11.9-8.9 23.3-18.7 34.3-29.5c14.7-14.6 27.6-30.6 38.3-48.4c7-11.8 12.8-24.5 17.1-37.6c1.6-4.9 2.8-10 3.8-15c1-5.1 1.5-10.3 1.5-15.6c0-14.7-2.9-29.3-8.6-43.2c-5.8-14.2-13.8-27.7-23.8-40.2c-1.4-1.7-2.9-3.4-4.5-5.1c4.5-3.3 9.4-5.6 14.6-6.8c12.2-2.9 24.6-4.3 37.1-4.3c27.5 0 54.9 5.8 80.8 17.1c26.1 11.4 49.6 27.9 69.8 49.3c15.9 17 28.3 36.3 37.4 57.6c9.1 21.2 14.2 44.1 15.1 67.2c1.7 44.5-13.1 87.8-42.5 122.9c-29.4 35.1-69.6 57.9-114.7 63.8c-1.7 .2-3.4 .3-5.1 .5c-1.3 .2-2.5 .5-3.8 .6l-149.3 46.6c-13.3 4.1-27.1 6.1-40.9 6.1c-17.7 0-35.3-2.5-52.5-7.5l-63.5-18.4c-12.7-3.7-25.5-5.5-38.3-5.5c-35.3 0-64 28.7-64 64s28.7 64 64 64H112c35.25 0 64-28.75 64-64V448h145c11.3 0 22.6-1.5 33.9-4.5c44.8-11.9 84.1-39.2 114.6-77.9c30.3-38.6 47.9-86.8 48.9-136.5c1.4-71.9-28.7-142.1-85-189.6c-1.1-1-2.2-2.1-3.4-3.1c-14.1-12.3-30.8-22.3-49.3-29.5c-1.6-.6-3.1-1.3-4.7-1.9c-1.7-.6-3.4-1.1-5.1-1.5z"/></svg>
          SFA
        </button>
        <button onclick="copyToClipboardAsTarget('bfr')" class="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-sm font-semibold text-white flex flex-col justify-center items-center transition-transform transform hover:scale-105 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="size-6 mb-1"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm288 32c0-11.5 6.1-22 16-27.6l80-45.7c10.8-6.2 24.3-3.4 31.5 6.9s3.2 23.4-7.5 29.7l-80 45.7c-2.4 1.4-5 2.2-7.8 2.2s-5.4-.8-7.8-2.2l-128-73.1c-10.8-6.2-13.6-19.7-7.5-30.5s19.7-13.6 30.5-7.5L256 226.4V64c0-17.7 14.3-32 32-32s32 14.3 32 32v240c0 17.7-14.3 32-32 32s-32-14.3-32-32v-44.5l-80 45.7c-10.8 6.2-13.6 19.7-7.5 30.5s19.7 13.6 30.5 7.5L256 280.9V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V208c0-11.5-6.1-22-16-27.6L96 134.7c-10.8-6.2-24.3-3.4-31.5 6.9s-3.2 23.4 7.5 29.7l80 45.7c2.4 1.4 5 2.2 7.8 2.2s5.4-.8 7.8-2.2l128-73.1c10.8-6.2 13.6-19.7 7.5-30.5s-19.7-13.6-30.5-7.5L256 167.1V288z"/></svg>
          BFR
        </button>
        <button onclick="copyToClipboardAsRaw()" class="p-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-sm font-semibold text-white flex flex-col justify-center items-center transition-transform transform hover:scale-105 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="size-6 mb-1"><path d="M471.6 31.84c-3.641-4.22-8.527-6.552-13.69-6.552h-384c-5.164 0-10.05 2.332-13.69 6.552c-3.641 4.22-5.11 9.771-4.264 15.22l23.11 150.9C69.45 204.4 74.52 208 80 208h416c5.473 0 10.55-3.606 11.85-8.001l23.11-150.9C524.8 41.61 523.3 36.06 519.6 31.84zM240 336c0-8.836 7.164-16 16-16h64c8.836 0 16 7.164 16 16v160c0 8.836-7.164 16-16 16h-64c-8.836 0-16-7.164-16-16V336zM320 224c-8.836 0-16-7.164-16-16s7.164-16 16-16h64c8.836 0 16 7.164 16 16s-7.164 16-16 16h-64zM224 224h-64c-8.836 0-16-7.164-16-16s7.164-16 16-16h64c8.836 0 16 7.164 16 16S232.8 224 224 224zM416 336c0-8.836 7.164-16 16-16h64c8.836 0 16 7.164 16 16v160c0 8.836-7.164 16-16 16h-64c-8.836 0-16-7.164-16-16V336zM160 336c0-8.836 7.164-16 16-16h64c8.836 0 16 7.164 16 16v160c0 8.836-7.164 16-16 16h-64c-8.836 0-16-7.164-16-16V336z"/></svg>
          Raw
        </button>
      </div>

      <button onclick="toggleOutputWindow()" class="mt-2 w-full border-2 border-indigo-500 bg-transparent hover:bg-indigo-500 text-sm text-white font-semibold py-1 px-2 rounded-full transition-colors duration-300 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" class="size-4">
          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
        </svg>
        Close
      </button>

    </div>
  </div>
</div>
</div>
      <!-- Wildcards -->
      <div id="wildcards-window" class="fixed hidden z-30 top-0 right-0 w-full h-full flex justify-center items-center">
    <div class="w-[75%] max-w-md h-auto flex flex-col gap-2 p-4 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm border border-gray-300">
        <div class="flex w-full h-full gap-2 justify-between">
            <input id="new-domain-input" type="text" placeholder="Input wildcard" class="w-full h-full px-4 py-2 rounded-md focus:outline-0 bg-gray-700 text-white"/>
            <button onclick="registerDomain()" class="p-2 rounded-full bg-blue-600 hover:bg-blue-700 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path fill-rule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>

        <div id="container-domains" class="w-full h-32 rounded-md flex flex-col gap-1 overflow-y-scroll scrollbar-hide p-2 bg-gray-900"></div>

        <button onclick="toggleWildcardsWindow()" class="transform-gpu flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 p-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd"/>
    </svg>
    Close
</button>
    </div>
</div>
    </div>

    <footer>
    <div class="fixed bottom-4 right-4 flex flex-col items-end gap-3 z-50">
        <button onclick="toggleDropdown()" class="transition-colors rounded-full p-2 block text-white shadow-lg transform hover:scale-105 bg-accent-blue hover:bg-opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 text-white">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75h-6.75a.75.75 0 0 1 0-1.5h6.75V3a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
            </svg>
        </button>

        <div id="dropdown-menu" class="hidden flex flex-col gap-3">
            <a href="${DONATE_LINK}" target="_blank">
                <button class="bg-accent-cyan hover:bg-teal-600 rounded-full border-2 border-gray-900 p-2 block transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                        <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clip-rule="evenodd" />
                    </svg>
                </button>
            </a>

            <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank">
  <button class="bg-green-500 hover:bg-green-600 rounded-full border-2 border-gray-900 p-2 block transition-colors duration-200">
    <img src="https://geoproject.biz.id/circle-flags/whatsapp.png" alt="WhatsApp Icon" class="size-6">
  </button>
</a>

<a href="https://t.me/${TELEGRAM_USERNAME}" target="_blank">
  <button class="bg-blue-500 hover:bg-blue-600 rounded-full border-2 border-gray-900 p-2 block transition-colors duration-200">
    <img src="https://geoproject.biz.id/circle-flags/telegram.png" alt="Telegram Icon" class="size-6">
  </button>
</a>
            
            <button onclick="toggleWildcardsWindow()" class="bg-indigo-500 hover:bg-indigo-600 rounded-full border-2 border-gray-900 p-2 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                </svg>
            </button>

            <button onclick="toggleDarkMode()" class="bg-amber-500 hover:bg-amber-600 rounded-full border-2 border-gray-900 p-2 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
            </button>
        </div>
    </div>
</footer>
<script>
    function toggleDropdown() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        dropdownMenu.classList.toggle('hidden');
    }
</script>

<script>
    document.addEventListener('DOMContentLoaded', () => {
    const runningTitle = document.getElementById('runningTitle');
    const container = runningTitle.parentElement;
    let position = -runningTitle.offsetWidth; // Mulai dari luar kiri
    const speed = 1.5; // Kecepatan pergerakan

    function animateTitle() {
        position += speed;

        // Jika teks sudah melewati container, kembalikan ke posisi awal
        if (position > container.offsetWidth) {
            position = -runningTitle.offsetWidth;
        }

        // PERBAIKAN: Menggabungkan string dan variabel dengan tanda '+'
        runningTitle.style.transform = 'translateX(' + position + 'px)';

        requestAnimationFrame(animateTitle);
    }

    animateTitle();
});
</script>


     <script>
  document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      // Tunggu 5 detik sebelum memulai transisi
      setTimeout(() => {
        // Atur opacity menjadi 0 untuk memulai efek fade out
        loadingScreen.style.opacity = '0';
        
        // Setelah efek fade out selesai (500ms), sembunyikan elemen
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500); // Durasi ini harus sama dengan durasi transisi di CSS (duration-500)
      }, 1000); // <-- Ini adalah jeda 5 detik
    }
  });
    
      // Shared
      const rootDomain = "${serviceName}.${rootDomain}";
      const notification = document.getElementById("notification-badge");
      const windowContainer = document.getElementById("container-window");
      const windowInfoContainer = document.getElementById("container-window-info");
      const converterUrl =
        "https://script.google.com/macros/s/AKfycbwwVeHNUlnP92syOP82p1dOk_-xwBgRIxkTjLhxxZ5UXicrGOEVNc5JaSOu0Bgsx_gG/exec";


      // Switches
      let isDomainListFetched = false;

      // Local variable
      let rawConfig = "";

      function getDomainList() {
        if (isDomainListFetched) return;
        isDomainListFetched = true;

        windowInfoContainer.innerText = "Fetching data...";

        const url = "https://" + rootDomain + "/api/v1/domains/get";
        const res = fetch(url).then(async (res) => {
          const domainListContainer = document.getElementById("container-domains");
          domainListContainer.innerHTML = "";

          if (res.status == 200) {
            windowInfoContainer.innerText = "Done!";
            const respJson = await res.json();
            for (const domain of respJson) {
              const domainElement = document.createElement("p");
              domainElement.classList.add("w-full", "bg-amber-400", "rounded-md");
              domainElement.innerText = domain;
              domainListContainer.appendChild(domainElement);
            }
          } else {
            windowInfoContainer.innerText = "Failed!";
          }
        });
      }

      function registerDomain() {
        const domainInputElement = document.getElementById("new-domain-input");
        const rawDomain = domainInputElement.value.toLowerCase();
        const domain = domainInputElement.value + "." + rootDomain;

        if (!rawDomain.match(/\\w+\\.\\w+$/) || rawDomain.endsWith(rootDomain)) {
          windowInfoContainer.innerText = "Invalid URL!";
          return;
        }

        windowInfoContainer.innerText = "Pushing request...";

        const url = "https://" + rootDomain + "/api/v1/domains/put?domain=" + domain;
        const res = fetch(url).then((res) => {
          if (res.status == 200) {
            windowInfoContainer.innerText = "Done!";
            domainInputElement.value = "";
            isDomainListFetched = false;
            getDomainList();
          } else {
            if (res.status == 409) {
              windowInfoContainer.innerText = "Domain exists!";
            } else {
              windowInfoContainer.innerText = "Error " + res.status;
            }
          }
        });
      }

      function copyToClipboard(text) {
        toggleOutputWindow();
        rawConfig = text;
      }

      function copyToClipboardAsRaw() {
        navigator.clipboard.writeText(rawConfig);

        notification.classList.remove("opacity-0");
        setTimeout(() => {
          notification.classList.add("opacity-0");
        }, 2000);
      }

      async function copyToClipboardAsTarget(target) {
        windowInfoContainer.innerText = "Generating config...";
        const url = "${CONVERTER_URL}";
        const res = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            url: rawConfig,
            format: target,
            template: "cf",
          }),
        });

        if (res.status == 200) {
          windowInfoContainer.innerText = "Done!";
          navigator.clipboard.writeText(await res.text());

          notification.classList.remove("opacity-0");
          setTimeout(() => {
            notification.classList.add("opacity-0");
          }, 2000);
        } else {
          windowInfoContainer.innerText = "Error " + res.statusText;
        }
      }

      function navigateTo(link) {
        window.location.href = link + window.location.search;
      }

      function toggleOutputWindow() {
        windowInfoContainer.innerText = "Select output:";
        toggleWindow();
        const rootElement = document.getElementById("output-window");
        if (rootElement.classList.contains("hidden")) {
          rootElement.classList.remove("hidden");
        } else {
          rootElement.classList.add("hidden");
        }
      }

      function toggleWildcardsWindow() {
        windowInfoContainer.innerText = "Domain list";
        toggleWindow();
        getDomainList();
        const rootElement = document.getElementById("wildcards-window");
        if (rootElement.classList.contains("hidden")) {
          rootElement.classList.remove("hidden");
        } else {
          rootElement.classList.add("hidden");
        }
      }

      function toggleWindow() {
        if (windowContainer.classList.contains("hidden")) {
          windowContainer.classList.remove("hidden");
        } else {
          windowContainer.classList.add("hidden");
        }
      }

      function toggleDarkMode() {
        const rootElement = document.getElementById("html");
        if (rootElement.classList.contains("dark")) {
          rootElement.classList.remove("dark");
        } else {
          rootElement.classList.add("dark");
        }
      }

      function checkProxy() {
    for (let i = 0; ; i++) {
        const pingElement = document.getElementById("ping-" + i);
        if (pingElement == undefined) return;

        const target = pingElement.textContent.split(" ").filter((ipPort) => ipPort.match(":"))[0];
        if (target) {
            pingElement.textContent = "Checking...";
        } else {
            continue;
        }

        let isActive = false;
        new Promise(async (resolve) => {
            const res = await fetch("https://${serviceName}.${rootDomain}/check?target=" + target)
                .then(async (res) => {
                    if (isActive) return;
                    if (res.status == 200) {
                        pingElement.classList.remove("dark:text-white");
                        const jsonResp = await res.json();
                        
                        // Periksa status dari JSON, bukan dari properti proxyip
                        if (jsonResp.status === "ACTIVE") {
                            isActive = true;
                            // Mengambil delay dan colo dari data JSON
                            const delay = jsonResp.delay || "N/A";
                            const colo = jsonResp.colo || "N/A";
                            pingElement.textContent = "Active " + delay + " (" + colo + ")";
                            pingElement.classList.add("text-green-600");
                            pingElement.classList.remove("text-red-600"); // Pastikan kelas lain dihapus
                        } else {
                            pingElement.textContent = "Inactive";
                            pingElement.classList.add("text-red-600");
                            pingElement.classList.remove("text-green-600"); // Pastikan kelas lain dihapus
                        }
                    } else {
                        pingElement.textContent = "Check Failed!";
                        pingElement.classList.add("text-red-600");
                        pingElement.classList.remove("text-green-600");
                    }
                })
                .finally(() => {
                    resolve(0);
                });
        });
    }
}

      function checkRegion() {
        for (let i = 0; ; i++) {
          const containerRegionCheck = document.getElementById("container-region-check-" + i);
          const configSample = document.getElementById("config-sample-" + i).value.replaceAll(" ", "");
          if (containerRegionCheck == undefined) break;

          const res = fetch(
            "https://api.foolvpn.me/regioncheck?config=" + encodeURIComponent(configSample)
          ).then(async (res) => {
            if (res.status == 200) {
              containerRegionCheck.innerHTML = "<hr>";
              for (const result of await res.json()) {
                containerRegionCheck.innerHTML += "<p>" + result.name + ": " + result.region + "</p>";
              }
            }
          });
        }
      }

      function checkGeoip() {
        const containerIP = document.getElementById("container-info-ip");
        const containerCountry = document.getElementById("container-info-country");
        const containerISP = document.getElementById("container-info-isp");
        const res = fetch("https://" + rootDomain + "/api/v1/myip").then(async (res) => {
          if (res.status == 200) {
            const respJson = await res.json();
            containerIP.innerText = "IP: " + respJson.ip;
            containerCountry.innerText = "Country: " + respJson.country;
            containerISP.innerText = "ISP: " + respJson.asOrganization;
          }
        });
      }

     function updateTime() {
    const timeElement = document.getElementById("time-info-value");
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB');
        timeElement.textContent = timeString;
    }
}

setInterval(updateTime, 1000);

      window.onload = () => {
        checkGeoip();
        checkProxy();
        updateTime();
        // checkRegion();
        const observer = lozad(".lozad", {
          load: function (el) {
            el.classList.remove("scale-95");
          },
        });
        observer.observe();
      };

      window.onscroll = () => {
        const paginationContainer = document.getElementById("container-pagination");

        if (window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight) {
          paginationContainer.classList.remove("-translate-y-6");
        } else {
          paginationContainer.classList.add("-translate-y-6");
        }
      };
    </script>
  </body>
</html>
`;

class Document {
    proxies = [];

    constructor(request) {
        this.html = baseHTML;
        this.request = request;
        this.url = new URL(this.request.url);
    }

    setTotalProxy(total) {
        this.html = this.html.replace(
            '<strong id="total-proxy-value" class="font-semibold">0</strong>',
            `<strong id="total-proxy-value" class="font-semibold">${total}</strong>`
        );
    }
    
    setPage(current, total) {
        this.html = this.html.replace(
            '<strong id="page-info-value" class="font-semibold">0/0</strong>',
            `<strong id="page-info-value" class="font-semibold">${current}/${total}</strong>`
        );
    }

setTitle(title) {
    this.html = this.html.replaceAll("PLACEHOLDER_JUDUL", title.replace("text-blue-500", "text-indigo-500"));
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
        proxyGroupElement += `<div class="lozad scale-95 mb-4 bg-blue-300/30 dark:bg-slate-800 transition-all duration-300 rounded-lg p-6 flex flex-col shadow-lg border border-white/20 hover:scale-105 backdrop-blur-md">`;
        
        // Header Kartu: Ping dan Bendera
        proxyGroupElement += `  <div class="flex justify-between items-center">`;
        
        // Elemen Ping di kiri
        proxyGroupElement += `    <div id="ping-${i}" class="animate-pulse text-xs font-semibold text-left">
    <span class="text-red-500 dark:text-red-400">I</span><span class="text-orange-500 dark:text-orange-400">d</span><span class="text-yellow-500 dark:text-yellow-400">l</span><span class="text-green-500 dark:text-green-400">e</span>
    <span class="text-slate-500 dark:text-slate-400">${proxyData.proxyIP}:${proxyData.proxyPort}</span>
</div>`;

        // Logo Bendera di kanan
        proxyGroupElement += `    <div class="rounded-full overflow-hidden border-4 border-white dark:border-slate-800">`;
proxyGroupElement += `        <img width="40" src="https://hatscripts.github.io/circle-flags/flags/${proxyData.country.toLowerCase()}.svg" class="flag-spin" />`; // Tambahkan class="flag-spin"
proxyGroupElement += `    </div>`;
        
        proxyGroupElement += `  </div>`; // Penutup div flexbox
        
        // Konten Kartu
        proxyGroupElement += `  <div class="rounded-lg py-4 px-4 bg-blue-200/20 dark:bg-slate-700/50 flex-grow mt-4">`;
        proxyGroupElement += `    <h5 class="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 overflow-x-scroll scrollbar-hide text-nowrap">${proxyData.org}</h5>`;
        proxyGroupElement += `    <div class="text-slate-600 dark:text-slate-300 text-sm">`;
        proxyGroupElement += `      <p>IP: ${proxyData.proxyIP}</p>`;
        proxyGroupElement += `      <p>Port: ${proxyData.proxyPort}</p>`;
        proxyGroupElement += `      <div id="container-region-check-${i}">`;
        proxyGroupElement += `        <input id="config-sample-${i}" class="hidden" type="text" value="${proxyData.list[0]}">`;
        proxyGroupElement += `      </div>`;
        proxyGroupElement += `    </div>`;
        proxyGroupElement += `  </div>`;
        
        // Tombol Konfigurasi
        proxyGroupElement += `  <div class="grid grid-cols-2 gap-2 mt-4 text-sm">`;
        
        const indexName = [
            `${reverse("NAJORT")} TLS`,
            `${reverse("SSELV")} TLS`,
            `${reverse("SS")} TLS`,
            `${reverse("NAJORT")} NTLS`,
            `${reverse("SSELV")} NTLS`,
            `${reverse("SS")} NTLS`,
        ];
        
        for (let x = 0; x < proxyData.list.length; x++) {
            const proxy = proxyData.list[x];
            // Tombol kuning keemasan di mode terang, tetap biru di mode gelap
            proxyGroupElement += `<button class="bg-yellow-400 hover:bg-yellow-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-md p-1.5 w-full text-black dark:text-white font-semibold transition-colors duration-200 text-xs" onclick="copyToClipboard('${proxy}')">${indexName[x]}</button>`;
        }
        
        proxyGroupElement += `  </div>`;
        proxyGroupElement += `</div>`; // Penutup Kartu
    }
    proxyGroupElement += `</div>`; // Penutup Grid Kontainer

    this.html = this.html.replaceAll("PLACEHOLDER_PROXY_GROUP", `${proxyGroupElement}`);
}

    buildCountryFlag() {
        const proxyBankUrl = this.url.searchParams.get("proxy-list");
        const selectedCC = this.url.searchParams.get("cc"); // Get the selected country from URL
        const flagList = [];
        for (const proxy of cachedProxyList) {
            flagList.push(proxy.country);
        }

        let flagElement = "";
        for (const flag of new Set(flagList)) {
            const isSelected = selectedCC === flag;
            // Apply different classes based on selection state
            const linkClasses = isSelected 
                ? 'border-2 border-blue-400 rounded-lg p-0.5' // Classes for selected flag
                : 'py-1';                                     // Classes for non-selected flag

            flagElement += `<a href="/sub?cc=${flag}${proxyBankUrl ? "&proxy-list=" + proxyBankUrl : ""
                }" class="flex items-center justify-center ${linkClasses}" ><img width=30 src="https://hatscripts.github.io/circle-flags/flags/${flag.toLowerCase()}.svg" /></a>`;
        }

        this.html = this.html.replaceAll("PLACEHOLDER_BENDERA_NEGARA", flagElement);
    }

    addPageButton(text, link, isDisabled) {
    const pageButton = `<li><button ${
        isDisabled ? "disabled" : ""
    } class="px-3 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-semibold border-2 border-neutral-800 rounded-md transition-colors" onclick=navigateTo('${link}')>${text}</button></li>`;

    this.html = this.html.replaceAll("PLACEHOLDER_PAGE_BUTTON", `${pageButton}\nPLACEHOLDER_PAGE_BUTTON`);
}

    build() {
        this.buildProxyGroup();
        this.buildCountryFlag();

        this.html = this.html.replaceAll("PLACEHOLDER_API_READY", isApiReady ? "block" : "hidden");

        return this.html.replaceAll(/PLACEHOLDER_\w+/gim, "");
    }
}
