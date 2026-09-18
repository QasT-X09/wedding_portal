import sys
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

import uvicorn
import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    local_ip = get_local_ip()
    port = 8000
    print("=" * 60)
    print("💒 СВАДЕБНЫЙ ИНТЕРАКТИВНЫЙ МЕДИА-ПОРТАЛ ЗАПУСКАЕТСЯ...")
    print(f"👉 Локально на компьютере: http://127.0.0.1:{port}")
    print(f"📱 Для гостей в локальной сети: http://{local_ip}:{port}")
    print(f"🎥 Режим Проектора в зале:   http://{local_ip}:{port}/#live")
    print(f"📸 Галерея молодоженов:       http://{local_ip}:{port}/#gallery")
    print(f"🏷️ QR-коды для печати:        http://{local_ip}:{port}/#qr")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
