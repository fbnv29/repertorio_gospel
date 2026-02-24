require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(__dirname));

// PROXY API para Google Calendar (Protege tu API Key)
app.get('/api/next-event', async (req, res) => {
    try {
        const API_KEY = process.env.GOOGLE_API_KEY;
        const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

        if (!API_KEY || !CALENDAR_ID) {
            return res.status(500).json({ error: 'Configuración de API faltante' });
        }

        const timeMin = new Date().toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&singleEvents=true&orderBy=startTime&timeMin=${timeMin}&maxResults=1`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const event = data.items[0];
            const start = event.start.dateTime || event.start.date;
            res.json({
                summary: event.summary,
                start: start
            });
        } else {
            res.json({ message: 'No hay eventos próximos' });
        }
    } catch (error) {
        console.error('Error in proxy:', error);
        res.status(500).json({ error: 'Error al obtener el evento' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor de simulación iniciado!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔑 API Key protegida mediante proxy.`);
    console.log(`✨ Presiona CTRL+C para detener el servidor.\n`);
});
