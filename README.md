# HelpDeskPro - Support Ticket Management System

## 📋 Descripción General

HelpDeskPro es una aplicación web profesional de gestión de tickets de soporte técnico construida con **Next.js 14**, **TypeScript**, **MongoDB** y **Tailwind CSS**. El sistema permite la gestión eficiente de solicitudes de soporte, con roles diferenciados para clientes y agentes, notificaciones automáticas por correo electrónico y recordatorios programados.

## 👤 Datos del Desarrollador

- **Nombre:** Emanuel Gaviria
- **Clan:** Gosling
- **Correo:** gaviriacardonaemanuel@gmail.com
- **Documento de Identidad:** 1000920354

## ✨ Características Principales

### 🎫 Gestión de Tickets
- Creación, edición y cierre de tickets
- Estados: `open`, `in_progress`, `resolved`, `closed`
- Prioridades: `low`, `medium`, `high`
- Filtros por estado y prioridad
- Asignación de tickets a agentes

### 👥 Gestión de Usuarios
- Autenticación con JWT
- Dos roles: `client` y `agent`
- Protección de rutas por rol
- Contexto global de autenticación (Context API)

### 💬 Sistema de Comentarios
- Thread de conversación por ticket
- Clientes y agentes pueden comentar
- Visualización cronológica
- Indicador visual de respuestas de agentes

### 📧 Notificaciones por Correo
- Email al crear un ticket
- Email cuando un agente responde
- Email al cerrar un ticket
- Recordatorios automáticos para tickets sin respuesta

### ⚙️ Automatización
- Cron job que detecta tickets sin respuesta cada 6 horas
- Envío automático de recordatorios a agentes
- Configurable mediante variables de entorno

### 🎨 Componentes UI Reutilizables
- **Button** (variantes y tamaños)
- **Badge** (para estado y prioridad)
- **Card** (para listar tickets)
- **Input**, **Textarea**, **Select**

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de Datos:** MongoDB con Mongoose
- **Autenticación:** JWT (jsonwebtoken)
- **Email:** NodeMailer
- **Validación:** Custom validators
- **Automatización:** node-cron

## 📁 Estructura del Proyecto

```
HelpDeskPro/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── tickets/       # CRUD de tickets
│   │   │   └── comments/      # CRUD de comentarios
│   │   ├── client/            # Panel de cliente
│   │   ├── agent/             # Panel de agente
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de login
│   ├── components/
│   │   └── ui/                # Componentes reutilizables
│   │       ├── button/
│   │       ├── badge/
│   │       ├── card/
│   │       ├── input/
│   │       ├── textarea/
│   │       └── select/
│   ├── context/
│   │   └── AuthContext.tsx    # Contexto de autenticación
│   ├── lib/
│   │   ├── mongo.ts           # Conexión MongoDB
│   │   ├── auth.ts            # Utilidades JWT
│   │   └── mailer.ts          # Servicio de correos
│   ├── models/
│   │   ├── User.ts            # Modelo de usuario
│   │   ├── Ticket.ts          # Modelo de ticket
│   │   └── Comment.ts         # Modelo de comentario
│   ├── services/
│   │   ├── apiClient.ts       # Cliente Axios
│   │   ├── auth.ts            # Servicios de auth
│   │   ├── tickets.ts         # Servicios de tickets
│   │   └── comments.ts        # Servicios de comentarios
│   ├── types/
│   │   └── index.d.ts         # Tipos TypeScript
│   ├── utils/
│   │   └── validators.ts      # Validadores
│   └── cron/
│       └── reminders.ts       # Cron jobs
├── scripts/
│   └── seedUsers.ts           # Script para crear usuarios
├── .env.local                 # Variables de entorno
├── .env.example               # Ejemplo de variables
├── package.json
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm
- MongoDB (local o MongoDB Atlas)
- Cuenta de correo con SMTP (Gmail, SendGrid, etc.)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/HelpDeskPro.git
cd HelpDeskPro
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/Helpdeskpro

# JWT Secret
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion

# Email Configuration (NodeMailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM="HelpDeskPro <tu-email@gmail.com>"

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Job Configuration
CRON_REMINDER_ENABLED=true
CRON_REMINDER_HOURS_THRESHOLD=24
```

#### Configuración de Gmail:
1. Habilita la verificación en 2 pasos
2. Genera una contraseña de aplicación en https://myaccount.google.com/apppasswords
3. Usa esa contraseña en `EMAIL_PASS`


### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre (http://localhost:3000) en tu navegador.

## 📱 Uso de la Aplicación

### Panel de Cliente
1. Inicia sesión con una cuenta de cliente
2. Crea nuevos tickets con título, descripción y prioridad
3. Ve el estado de tus tickets
4. Agrega comentarios para más información
5. Recibe notificaciones por correo

### Panel de Agente
1. Inicia sesión con una cuenta de agente
2. Ve estadísticas de tickets (total, abiertos, en progreso, etc.)
3. Filtra tickets por estado y prioridad
4. Responde a los tickets
5. Actualiza estado y prioridad
6. Cierra tickets resueltos

## 🔐 Endpoints de API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Tickets
- `GET /api/tickets` - Listar tickets (con filtros)
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/[id]` - Obtener ticket
- `PUT /api/tickets/[id]` - Actualizar ticket
- `DELETE /api/tickets/[id]` - Eliminar ticket (solo agentes)

### Comentarios
- `GET /api/comments?ticketId=[id]` - Obtener comentarios de un ticket
- `POST /api/comments` - Agregar comentario

## 📸 Capturas de Pantalla

### Login
![Login](docs/screenshots/login.png)

### Panel de Cliente
![Client Dashboard](docs/screenshots/client-dashboard.png)

### Crear Ticket
![Create Ticket](docs/screenshots/create-ticket.png)

### Panel de Agente
![Agent Dashboard](docs/screenshots/agent-dashboard.png)

### Detalle de Ticket con Comentarios
![Ticket Detail](docs/screenshots/ticket-detail.png)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agrega nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request


**HelpDeskPro** - Sistema Profesional de Tickets de Soporte © 2025
