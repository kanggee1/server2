import requests
import csv
import shutil
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

def check_proxy(row, api_url_template):
    ip, port = row[0].strip(), row[1].strip()
    api_url = api_url_template.format(ip=ip, port=port)
    try:
        response = requests.get(api_url, timeout=60)
        response.raise_for_status()
        data = response.json()

        status = data.get("status", "").lower() == "active"
        if status:
            print(f"{ip}:{port} is ALIVE")
            return (row, None, None)  # Proxy hidup
        else:
            print(f"{ip}:{port} is DEAD")
            return (None, row, None)  # Proxy mati
    except requests.exceptions.RequestException as e:
        error_message = f"Error checking {ip}:{port}: {e}"
        print(error_message)
        return (None, None, error_message)
    except ValueError as ve:
        error_message = f"Error parsing JSON for {ip}:{port}: {ve}"
        print(error_message)
        return (None, None, error_message)

def main():
    input_file = os.getenv('IP_FILE', 'cek/output.txt')
    output_file = 'cek/output.txt'
    error_file = 'cek/error.txt'
    dead_file = 'cek/dead.txt'
    api_url_template = os.getenv('API_URL', 'https://check.installer.us.kg/check?ip={ip}:{port}')

    alive_proxies = []
    dead_proxies = []
    error_logs = []

    try:
        with open(input_file, "r") as f:
            reader = csv.reader(f)
            rows = list(reader)
    except FileNotFoundError:
        print(f"File {input_file} tidak ditemukan.")
        return

    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = {executor.submit(check_proxy, row, api_url_template): row for row in rows if len(row) >= 2}

        for future in as_completed(futures):
            alive, dead, error = future.result()
            if alive:
                alive_proxies.append(alive)
            if dead:
                dead_proxies.append(dead)
            if error:
                error_logs.append(error)

    try:
        with open(output_file, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerows(alive_proxies)
        print(f"Proxy hidup telah disimpan di {output_file}.")
    except Exception as e:
        print(f"Error menulis ke {output_file}: {e}")
        return

    try:
        with open(dead_file, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerows(dead_proxies)
        print(f"Proxy mati telah disimpan di {dead_file}.")
    except Exception as e:
        print(f"Error menulis ke {dead_file}: {e}")

    if not error_logs:
        open(error_file, "w").close()
    else:
        try:
            with open(error_file, "w") as f:
                for error in error_logs:
                    f.write(error + "\n")
            print(f"Beberapa error telah dicatat di {error_file}.")
        except Exception as e:
            print(f"Error menulis ke {error_file}: {e}")

    try:
        shutil.move(output_file, input_file)
        print(f"{input_file} telah diperbarui dengan proxy yang ALIVE.")
    except Exception as e:
        print(f"Error menggantikan {input_file}: {e}")

if __name__ == "__main__":
    main()
