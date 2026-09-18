# Публикация свадебного портала

Проект подготовлен для одного Linux-сервера с Docker. React-сборка, FastAPI,
SQLite, оригиналы файлов и превью запускаются как единый сайт; данные не
пропадут при перезапуске контейнеров.

## Что нужно заранее

1. Сервер Ubuntu 24.04 с публичным IPv4 и минимум 60 ГБ SSD. Для 30 ГБ
   оригиналов лучше выделить 80 ГБ, чтобы оставить место для превью и обновлений.
2. Домен или бесплатный поддомен, например `my-wedding.duckdns.org`.
3. DNS-запись `A` домена, указывающая на IPv4 сервера.

## На сервере

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
```

Заново войдите по SSH, затем загрузите папку проекта в `/opt/wedding_portal`.
В файле `Caddyfile` замените `your-domain.example` на свой домен. Откройте
порты 80 и 443 в firewall/правилах облака и запустите:

```bash
cd /opt/wedding_portal
docker compose up -d --build
docker compose ps
```

Откройте `https://ваш-домен`. Caddy самостоятельно выпустит и будет обновлять
HTTPS-сертификат. QR-код на сайте будет содержать этот же публичный адрес.

## Обновление и резервная копия

```bash
cd /opt/wedding_portal
docker compose up -d --build
docker compose exec wedding-portal sh -c 'tar -czf /tmp/wedding-backup.tgz /app/data /app/uploads /app/thumbnails /app/exports'
docker cp $(docker compose ps -q wedding-portal):/tmp/wedding-backup.tgz ./wedding-backup.tgz
```

Скачайте `wedding-backup.tgz` на компьютер после свадьбы. Оригиналы находятся
в Docker-томе `wedding-uploads`; не удаляйте этот том, пока не сделали копию.
