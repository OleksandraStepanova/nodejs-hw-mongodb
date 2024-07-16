import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { env } from './utils/env.js';
import router from './routers/contacts.js';

const PORT = Number(env('PORT', '3000'));

export default function setupServer() {
    const app = express();

    app.use(express.json());

    app.use(cors());

    app.use(
        pino({
            transport: {
                target: 'pino-pretty',
            },
        }),
    );

    app.use(router);


    app.use('*', (req, res, _next) => {
        res.status(404).json({
            message: 'Not found',
        });
    });

    app.use((error, req, res, _next) => {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error!",
        });
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}


