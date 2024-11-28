import express from "express";
import NodeCache from "node-cache";
import fetchGameDetails from "../controllers/gameController.js";
import db from "../firebaseConfig.js";
import rateLimit from "express-rate-limit";
import logger from "../index.js";

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 1 minute',
  })

const router = express.Router();

router.use(limiter);
const cache = new NodeCache({
    stdTTL: 0, // Items will not expire by default
    checkperiod: 600 // Check for expired items every 10 minutes
});



router.get("/:gameId", async (req, res) => {
    const gameId = req.params.gameId;
    logger.info(`Fetching game data for game ID: ${gameId}`);

    if (!gameId) {
        logger.info("GameId is required");
        return res.status(400).send({ error: "GameId is required" });
        
    }
    
    const cachedGameData = cache.get(gameId);
    
    cachedGameData ? logger.info(`CachedGameData found ${gameId}`) :fetchGameDetails(gameId);
    cachedGameData ? console.log(`CachedGameData found for ${gameId}, continuing`) : logger.info(`CachedGameData not found for ${gameId}`);


    if (cachedGameData) {
        logger.info(`CachedGameData found ${gameId}`);
        return res.status(200).send(cachedGameData);
    } else {
        logger.info(`CachedGameData not found for ${gameId}, fetching gameData now.`);
        try {
            const gameData = await fetchGameDetails(gameId);
            cache.set(gameId, gameData);
            
            logger.info(`GameData fetched and cached for ${gameId}`);
            return res.status(200).send(gameData);
        } catch (error) {
            logger.error(`Error fetching game data: ${error}`);
            return res.status(500).send({ error: "Error fetching game data" });
        }
    }
});

export default router;
