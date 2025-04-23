import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { ref, content } = JSON.parse(event.body);

    try {
        const client = await pool.connect();
        const checkResult = await client.query('SELECT ref FROM tickets WHERE ref = $1', [ref]);

        if (checkResult.rows.length > 0) {
            await client.query('UPDATE tickets SET content = $1 WHERE ref = $2', [content, ref]);
        } else {
            await client.query('INSERT INTO tickets (ref, content) VALUES ($1, $2)', [ref, content]);
        }
        client.release();

        return { statusCode: 200, body: JSON.stringify({ message: 'Ticket saved successfully' }) };
    } catch (error) {
        console.error('Error saving ticket:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
