# Deployment Guide - Frontend

Це фронтенд частина UArchery застосунку.

## Повна інструкція

Повна інструкція з деплою (фронтенд + бекенд) знаходиться в репозиторії бекенду:
`archery-app-backend/DEPLOYMENT.md`

---

## Швидкий старт (тільки frontend)

### 1. Структура на сервері

```
/srv/archery-front/
├── docker-compose.yml    # Копія з deploy/docker-compose.front.yml
├── .env                  # Build-time змінні
└── src/                  # Цей git репозиторій
```

### 2. Деплой

```bash
# Створення директорії
sudo mkdir -p /srv/archery-front
sudo chown -R $USER:$USER /srv/archery-front

# Клонування
cd /srv/archery-front
git clone https://github.com/YOUR_ORG/app-archery.git src

# Docker compose
cp src/deploy/docker-compose.front.yml docker-compose.yml

# Environment variables
cat > .env << EOF
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_AUTH_URL=https://api.yourdomain.com/auth/google
EOF

# Запуск
docker compose up -d --build
```

### 3. Оновлення

```bash
cd /srv/archery-front/src
git pull origin main
cd ..
docker compose up -d --build
```

---

## Локальна розробка

```bash
# Встановлення залежностей
pnpm install

# Dev server
pnpm dev

# Build для production
pnpm build

# Preview production build
pnpm start
```

---

## Docker для локальної розробки

```bash
# Build та запуск
docker compose up -d --build

# Відкрити http://localhost:8080
```

---

## Змінні оточення

| Змінна | Опис | Приклад |
|--------|------|---------|
| `VITE_API_BASE_URL` | URL бекенд API | `https://api.yourdomain.com` |
| `VITE_GOOGLE_AUTH_URL` | URL для Google OAuth | `https://api.yourdomain.com/auth/google` |

⚠️ Всі Vite змінні повинні мати префікс `VITE_`
