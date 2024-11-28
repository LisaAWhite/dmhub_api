import express from "express";
import db from "../firebaseConfig.js";
import NodeCache from "node-cache";
import fetchGameDetails from "../controllers/gameController.js";

console.log("Initializing character route");

const router = express.Router();
const cache = new NodeCache({
    stdTTL: 0, // Items will not expire by default
    checkperiod: 600 // Check for expired items every 10 minutes
});

router.get("/:characterId", async (req, res) => {
    const gameId = req.gameId; // Retrieve gameId from the request object
    const characterId = req.params.characterId; // Retrieve characterId from the request object

    console.log("GameId:", gameId);
    console.log("characterId:", characterId);

    if (!gameId) {
        return res.status(400).send({ error: "GameId is required" });
    }

    const cachedGameData = cache.get(gameId);
    console.log("CachedGameData:", cachedGameData);

    if (!cachedGameData) {
        console.log("character.js - Fetching game data for gameId:", gameId);
        try {
            const gameData = await fetchGameDetails(gameId);
            cache.set(gameId, gameData);
            const characterData = gameData.characters?.[characterId];
            if (characterData) {
                console.log("Cache miss - Data fetched");
                return res.status(200).send(characterData);
            } else {
                return res.status(404).send({ error: "Character not found" });
            }
        } catch (error) {
            console.error("Error fetching game data:", error);
            return res.status(500).send({ error: "Error fetching game data" });
        }
    }

    if (cachedGameData) {
        const characterData = cachedGameData.characters?.[characterId];
        if (characterData) {
            console.log("Cache hit");
            return res.status(200).send(characterData);
        } else {
            return res.status(404).send({ error: "Character not found" });
        }
    }
});

export default router;