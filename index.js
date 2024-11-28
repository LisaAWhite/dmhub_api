import express from "express";
import router from "express";
import bodyParser from "body-parser";
import db from "./firebaseConfig.js"; // Ensure the path is correct
import NodeCache from "node-cache";
import gameRoutes from "./routes/game.js";
import charaterRoutes from "./routes/character.js";
import monsterRoutes from "./routes/monster.js";
import modulesRoutes from "./routes/modules.js";
import objectRoutes from "./routes/object.js";
import winston, { format } from "winston";
import morgan from 'morgan';
import verifyToken from "./middleware/verifyToken.js";

const app = express();

app.use(bodyParser.json());

app.use(verifyToken);
app.use(morgan('combined'));

const PORT = process.env.PORT || 3000;

const cache = new NodeCache({
    stdTTL: 0, // Items will not expire by default
    checkperiod: 600 // Check for expired items every 10 minutes
});


// Use the game routes
app.use('/game', gameRoutes);

// Use the character routes
app.use('/game/:gameId/character', (req, res, next) => {
    req.gameId = req.params.gameId; // Attach gameId to the request object
    console.log("characterIndex/GameId:", req.gameId);
    next();
}, charaterRoutes);

// Use the monster routes
app.use('/game/:gameId/monster', (req, res, next) => {
    req.gameId = req.params.gameId; // Attach gameId to the request object
    console.log("monsterIndex/GameId:", req.gameId);
    next();
}, monsterRoutes);

// Use the modules routes
app.use('/game/:gameId/modules', (req, res, next) => {
    req.gameId = req.params.gameId; // Attach gameId to the request object
    console.log("moduleIndex/GameId:", req.gameId);
    next();
}, modulesRoutes);

// Use the object routes
app.use('/game/:gameId/object', (req, res, next) => {
    req.gameId = req.params.gameId; // Attach gameId to the request object
    console.log("objectIndex/GameId:", req.gameId);
    next();
}, objectRoutes);

const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
        format.label({ label: 'index.js' }),
        format.timestamp(),
        format.splat(),
        format.simple(),
        format.printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
        })),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
    ]})


app.listen(PORT, () => {
    logger.info(`Server is running on Port: ${PORT}`);
    logger.info(`Cache checkperiod: ${cache.options.checkperiod}`);
    logger.info(`Cache stdTTL: ${cache.options.stdTTL}`);
});

export default logger;