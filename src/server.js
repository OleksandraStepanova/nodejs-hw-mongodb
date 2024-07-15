import express from 'express';
import cors from 'cors';
import pino from 'pino-http';


export default function setupServer() {
    const app = express();

    app.use(cors());

    app.use(
        pino({
            transport: {
                target: 'pino-pretty',
            },
        }),
    );

    app.use('*', (req, res, next) => {
        res.status(404).json({
            message: 'Not found',
        })
    })

    const PORT = 3000;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}


