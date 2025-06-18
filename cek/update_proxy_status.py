import requests
import csv
import os
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Konfigurasi logging
logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Set untuk menyimpan proxy yang sudah berhasil dicek dan aktif
# Menggunakan threading.Lock untuk memastikan akses yang aman dari beberapa thread
active_proxies = set()
active_proxies_lock = threading.Lock()

def check_proxy(row, api_url_template, alive_file, dead_file):
    """
    Mengecek status proxy berdasarkan IP dan port yang diberikan.
    Hasil pengecekan akan disimpan di file `alive_file` atau `dead_file`.
    """
    ip, port = row[0].strip(), row[1].strip()
    proxy_identifier = f"{ip}:{port}" # Buat identifikasi unik untuk setiap proxy

    # Cek apakah proxy ini sudah ada di daftar aktif_proxies
    with active_proxies_lock:
        if proxy_identifier in active_proxies:
            logging.info(f"{proxy_identifier} sudah ada di daftar aktif. Melewatkan.")
            return True # Anggap sudah diurus

    api_url = api_url_template.format(ip=ip, port=port)

    try:
        response = requests.get(api_url, timeout=60)
        response.raise_for_status()
        data = response.json()

        if data.get("status", "").lower() == "active":
            logging.info(f"{proxy_identifier} is ✅ ACTIVE")
            with active_proxies_lock:
                # Tambahkan ke set hanya jika belum ada
                if proxy_identifier not in active_proxies:
                    active_proxies.add(proxy_identifier)
                    with open(alive_file, "a", newline="") as f:
                        csv.writer(f).writerow(row)
            return True  # Proxy hidup
        else:
            logging.info(f"{proxy_identifier} is ❌ DEAD")
            with open(dead_file, "a", newline="") as f:
                csv.writer(f).writerow(row)
            return False  # Proxy mati
    except requests.exceptions.RequestException as e:
        logging.error(f"Error checking {proxy_identifier}: {e}")
    except ValueError as ve:
        logging.error(f"Error parsing JSON for {proxy_identifier}: {ve}")
    return False

def main():
    """Fungsi utama untuk membaca daftar proxy, mengecek status, dan menyimpan hasilnya."""
    input_file = os.getenv("IP_FILE", "cek/file.txt")
    alive_file = os.getenv("ALIVE_FILE", "cek/proxyList.txt")
    dead_file = os.getenv("DEAD_FILE", "cek/dead.txt")
    api_url_template = os.getenv("API_URL", "https://api.checker-ip.web.id/check?ip={ip}:{port}")

    # Kosongkan file sebelum digunakan kembali
    # Kita akan menulis ulang file alive_file di akhir agar bersih dari duplikat
    # dead_file bisa tetap di-append karena duplikat di sana tidak terlalu masalah
    with open(dead_file, "w") as f:
        f.truncate(0)

    # Baca daftar proxy dari file
    try:
        with open(input_file, "r") as f:
            reader = csv.reader(f)
            rows = [row for row in reader if len(row) >= 2]
    except FileNotFoundError:
        logging.error(f"File {input_file} tidak ditemukan.")
        return

    if not rows:
        logging.warning("Tidak ada data proxy yang valid dalam file input.")
        return

    # Gunakan ThreadPoolExecutor untuk memproses proxy secara paralel
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = {executor.submit(check_proxy, row, api_url_template, alive_file, dead_file): row for row in rows}

        for future in as_completed(futures):
            future.result()  # Tunggu proses selesai

    # Setelah semua thread selesai, tulis ulang file alive_file dari set aktif_proxies
    # Ini memastikan tidak ada duplikat dan file selalu bersih
    with open(alive_file, "w", newline="") as f:
        writer = csv.writer(f)
        for proxy_id in active_proxies:
            ip, port = proxy_id.split(":")
            writer.writerow([ip, port])

    logging.info(f"Semua proxy yang ALIVE (unik) telah disimpan di {alive_file}.")
    logging.info(f"Semua proxy yang DEAD telah disimpan di {dead_file}.")

if __name__ == "__main__":
    main()
