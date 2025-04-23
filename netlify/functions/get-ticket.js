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

    const { ref } = JSON.parse(event.body);

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT content FROM tickets WHERE ref = $1', [ref]);
        client.release();

        if (result.rows.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ content: result.rows[0].content }),
            };
        } else {
            return { statusCode: 404, body: JSON.stringify({ message: 'Ticket not found' }) };
        }
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
