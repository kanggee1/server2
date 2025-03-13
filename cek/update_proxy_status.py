import requests
import csv
import os
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

# Konfigurasi logging
logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)

def check_proxy(row, api_url_template, alive_file, dead_file):
    """
    Mengecek status proxy berdasarkan IP dan port yang diberikan.
    Hasil pengecekan akan disimpan di file `alive_file` atau `dead_file`.
    """
    ip, port = row[0].strip(), row[1].strip()
    api_url = api_url_template.format(ip=ip, port=port)

    try:
        response = requests.get(api_url, timeout=60)
        response.raise_for_status()
        data = response.json()

        if data.get("status", "").lower() == "active":
            logging.info(f"{ip}:{port} is ✅ ACTIVE")
            with open(alive_file, "a", newline="") as f:
                csv.writer(f).writerow(row)
            return True  # Proxy hidup
        else:
            logging.info(f"{ip}:{port} is ❌ DEAD")
            with open(dead_file, "a", newline="") as f:
                csv.writer(f).writerow(row)
            return False  # Proxy mati
    except requests.exceptions.RequestException as e:
        logging.error(f"Error checking {ip}:{port}: {e}")
    except ValueError as ve:
        logging.error(f"Error parsing JSON for {ip}:{port}: {ve}")
    return False

def main():
    """Fungsi utama untuk membaca daftar proxy, mengecek status, dan menyimpan hasilnya."""
    input_file = os.getenv("IP_FILE", "cek/file.txt")
    alive_file = os.getenv("ALIVE_FILE", "cek/proxyList.txt")
    dead_file = os.getenv("DEAD_FILE", "cek/dead.txt")
    api_url_template = os.getenv("API_URL", "https://api.checker-ip.web.id/check?ip={ip}:{port}")

    # Kosongkan file sebelum digunakan kembali
    for file in (alive_file, dead_file):
        with open(file, "w") as f:
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

    logging.info(f"Semua proxy yang ALIVE telah disimpan di {alive_file}.")
    logging.info(f"Semua proxy yang DEAD telah disimpan di {dead_file}.")

if __name__ == "__main__":
    main()
