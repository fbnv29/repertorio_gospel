export const handler = async (event, context) => {
    try {
        const API_KEY = process.env.GOOGLE_API_KEY;
        const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

        if (!API_KEY || !CALENDAR_ID) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Configuración faltante en Netlify' })
            };
        }

        const timeMin = new Date().toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&singleEvents=true&orderBy=startTime&timeMin=${timeMin}&maxResults=1`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const eventData = data.items[0];
            const start = eventData.start.dateTime || eventData.start.date;
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    summary: eventData.summary,
                    start: start
                })
            };
        } else {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: 'No hay eventos próximos' })
            };
        }
    } catch (error) {
        console.error('Error in function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al obtener el evento' })
        };
    }
};
