# Cañada al Lago - Sitio Web Turístico

![Cañada al Lago](https://img.shields.io/badge/Cañada-al%20Lago-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.0-purple)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)

Sitio web oficial de **Cañada al Lago**, complejo de cabañas y casas de turismo ubicado en Villa Parque Siquiman, Córdoba, Argentina. Desarrollado con React + Vite y desplegado en Firebase.

## 🏞️ Descripción

Este proyecto es la renovación del sitio web [canadaallago.com](http://www.canadaallago.com/), migrado desde HTML estático a una aplicación moderna con React y Vite para mejorar la experiencia de usuario y el rendimiento.

## ✨ Características

- **Diseño Responsive**: Adaptado a todos los dispositivos
- **Navegación Sútil**: Scroll suave entre secciones
- **Galería Interactiva**: Modal para visualización de imágenes
- **Formulario de Contacto**: Integrado con EmailJS
- **Optimización SEO**: Meta tags y estructura semántica
- **Rendimiento**: Carga rápida con Vite
- **WhatsApp Integration**: Botón flotante de contacto directo

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **Estilos**: Bootstrap 5 + CSS personalizado
- **Iconos**: Font Awesome
- **Formularios**: EmailJS
- **Hosting**: Firebase Hosting
- **Deployment**: Firebase CLI

## 📦 Estructura del Proyecto

canadaallago/
├── 🗂️ public/ # Archivos públicos
│ ├── 📁 assets/
│ │ ├── 📁 img/ # Imágenes del sitio
│ │ │ ├── 🖼️ fotos/ # Galería de fotos
│ │ │ └── 🏠 casas/ # Fotos de las cabañas
│ │ ├── 📁 css/ # Hojas de estilo adicionales
│ │ └── 📁 js/ # Scripts de terceros
│ └── 📄 index.html # Template HTML principal
├── 🗂️ src/ # Código fuente de la aplicación
│ ├── 📁 components/ # Componentes React
│ │ ├── 🧩 Header.jsx # Encabezado principal
│ │ ├── 🧩 Navbar.jsx # Barra de navegación
│ │ ├── 🧩 About.jsx # Sección "Inicio"
│ │ ├── 🧩 Cabanas.jsx # Sección "Cabañas"
│ │ ├── 🧩 Gallery.jsx # Galería de fotos
│ │ ├── 🧩 Activities.jsx # Actividades
│ │ ├── 🧩 Contact.jsx # Formulario de contacto
│ │ ├── 🧩 Testimonials.jsx # Testimonios
│ │ ├── 🧩 Footer.jsx # Pie de página
│ │ └── 🧩 WhatsAppButton.jsx # Botón flotante
│ ├── 🧩 App.jsx # Componente raíz
│ ├── 🧩 main.jsx # Punto de entrada
│ └── 📄 index.css # Estilos globales
├── ⚙️ package.json # Dependencias y scripts
├── ⚙️ vite.config.js # Configuración de Vite
├── ⚙️ firebase.json # Configuración de Firebase
├── 🔒 .env # Variables de entorno (local)
├── 📄 .gitignore # Archivos ignorados por Git
└── 📖 README.md # Este archivo
