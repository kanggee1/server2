import requests
import csv
import os
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Konfigurasi logging
logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Set untuk menyimpan proxy yang sudah berhasil dicek dan aktif (dalam format IP:Port)
active_proxies_identifiers = set()
active_proxies_identifiers_lock = threading.Lock()

# List untuk menyimpan seluruh baris data proxy yang aktif (termasuk negara dan penyedia)
active_proxies_data = []
active_proxies_data_lock = threading.Lock()

# Counter untuk IP yang mati
dead_proxies_count = 0
dead_proxies_count_lock = threading.Lock()

def check_proxy(row, api_url_template, dead_file):
    """
    Mengecek status proxy berdasarkan IP dan port yang diberikan.
    Hasil pengecekan untuk proxy mati akan disimpan di file `dead_file`.
    Data proxy aktif akan disimpan di list global.
    """
    # Pastikan baris memiliki setidaknya 2 elemen (IP dan Port)
    if len(row) < 2:
        logging.warning(f"Baris tidak valid, dilewati: {row}")
        return False

    ip, port = row[0].strip(), row[1].strip()
    proxy_identifier = f"{ip}:{port}" # Buat identifikasi unik untuk setiap proxy

    # Ambil informasi tambahan jika tersedia
    country = row[2].strip() if len(row) > 2 else "N/A"
    provider = row[3].strip() if len(row) > 3 else "N/A"

    # Cek apakah proxy ini sudah ada di daftar aktif_proxies_identifiers
    with active_proxies_identifiers_lock:
        if proxy_identifier in active_proxies_identifiers:
            logging.info(f"{proxy_identifier} (sudah di daftar aktif) - Melewatkan pengecekan API.")
            return True # Anggap sudah diurus dan aktif

    api_url = api_url_template.format(ip=ip, port=port)

    try:
        response = requests.get(api_url, timeout=60)
        response.raise_for_status()
        data = response.json()

        if data.get("status", "").lower() == "active":
            # Format log sesuai permintaan
            log_message = f"[ALIVE] {proxy_identifier} - {country} - {provider}"
            logging.info(log_message)

            with active_proxies_identifiers_lock:
                # Tambahkan identifier ke set hanya jika belum ada
                if proxy_identifier not in active_proxies_identifiers:
                    active_proxies_identifiers.add(proxy_identifier)
                    # Tambahkan seluruh baris data ke list aktif
                    with active_proxies_data_lock:
                        active_proxies_data.append(row)
            return True  # Proxy hidup
        else:
            # Format log untuk DEAD
            log_message = f"[DEAD] {proxy_identifier} - {country} - {provider}"
            logging.info(log_message)

            with dead_proxies_count_lock:
                global dead_proxies_count
                dead_proxies_count += 1
            # Tulis seluruh baris ke dead_file
            with open(dead_file, "a", newline="") as f:
                csv.writer(f).writerow(row)
            return False  # Proxy mati
    except requests.exceptions.RequestException as e:
        logging.error(f"Error checking {proxy_identifier}: {e}")
    except ValueError as ve:
        logging.error(f"Error parsing JSON for {proxy_identifier}: {ve}")
    finally:
        logging.debug(f"Selesai memproses {proxy_identifier}")
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

    # Catat waktu mulai
    start_time = time.time()
    logging.info("Memulai proses pengecekan proxy...")

    # Baca daftar proxy dari file
    try:
        with open(input_file, "r") as f:
            reader = csv.reader(f)
            # Simpan semua baris, kita akan filter yang valid nanti
            all_rows = [row for row in reader]
    except FileNotFoundError:
        logging.error(f"File {input_file} tidak ditemukan.")
        return

    # Filter baris yang valid (memiliki setidaknya IP dan Port)
    valid_rows = [row for row in all_rows if len(row) >= 2]

    if not valid_rows:
        logging.warning("Tidak ada data proxy yang valid dalam file input.")
        return

    total_proxies_to_process = len(valid_rows)
    logging.info(f"Total {total_proxies_to_process} proxy ditemukan untuk diproses.")

    # Gunakan ThreadPoolExecutor untuk memproses proxy secara paralel
    with ThreadPoolExecutor(max_workers=50) as executor:
        # Kirimkan hanya baris yang valid ke check_proxy
        futures = {executor.submit(check_proxy, row, api_url_template, dead_file): row for row in valid_rows}

        for future in as_completed(futures):
            future.result()  # Tunggu proses selesai

    # Catat waktu selesai
    end_time = time.time()
    duration = end_time - start_time

    # Setelah semua thread selesai, tulis ulang file alive_file dari active_proxies_data
    with open(alive_file, "w", newline="") as f:
        writer = csv.writer(f)
        for row_data in active_proxies_data:
            writer.writerow(row_data)

    # Log hasil akhir
    logging.info("--- Proses Pengecekan Proxy Selesai ---")
    logging.info(f"Waktu total eksekusi: {duration:.2f} detik")
    logging.info(f"Jumlah IP aktif (unik) yang ditemukan: {len(active_proxies_identifiers)}")
    logging.info(f"Jumlah IP mati yang ditemukan: {dead_proxies_count}")
    logging.info(f"Semua proxy yang ALIVE (dengan format lengkap) telah disimpan di {alive_file}.")
    logging.info(f"Semua proxy yang DEAD (dengan format lengkap) telah disimpan di {dead_file}.")

if __name__ == "__main__":
    main()
