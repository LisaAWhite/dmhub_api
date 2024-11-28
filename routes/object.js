import express from "express";
import db from "../firebaseConfig.js";
import NodeCache from "node-cache";
import fetchGameDetails from "../controllers/gameController.js";
import searchObjectData from "../controllers/objectController.js";
import rateLimit from "express-rate-limit";

console.log("Initializing object route");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again after 1 minute',
})


const router = express.Router();
const cache = new NodeCache({
    stdTTL: 0, // Items will not expire by default
    checkperiod: 600 // Check for expired items every 10 minutes
});


router.use(limiter);

router.get("/:dir/:objectId", async (req, res) => {
    const gameId = req.gameId; // Retrieve gameId from the request object
    const dir = req.params.dir; // Retrieve classId from the request object
    const objectId = req.params.objectId; // Retrieve objectId from the request object

    console.log(`GameId: ${gameId}, Dir: ${dir}, ObjectId: ${objectId}`);

    if (!objectId) {
        return res.status(400).send({ error: "ObjectId is required" });
    }   
// check game data cache

    let gameData = cache.get(gameId);
    gameData ? console.log("CachedGameData found") : console.log("CachedGameData not found"); 

    if (!gameData) {
        console.log("class.js - Fetching game data for gameId:", gameId);
        try {
            gameData = await fetchGameDetails(gameId);
            cache.set(gameId, gameData);
            console.log("class.js - GameData fetched and cached");
        } catch (error) {
            console.error("Error fetching game data:", error);
            return res.status(500).send({ error: "Error fetching game data" });
        }
    }

// check for mods in game data
    console.log("Checking for mods in game data");
    searchObjectData(gameData, dir, objectId, res);


    const objectData = gameData.assets?.objectTables?.[dir]?.table?.[objectId];
    objectData ? console.log("ObjectData found") : console.log("ObjectData not found");
    if (objectData) {
        return res.status(200).send(objectData);
    } else {        
        return res.status(404).send({ error: "ObjectData not found in cached game data" });
    }


    const cachedObjectData = cache.get(objectId);
})

export default router;