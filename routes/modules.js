import express from "express";
import db from "../firebaseConfig.js";
import NodeCache from "node-cache";
import fetchGameDetails from "../controllers/gameController.js";


console.log("Initializing module route");

const router = express.Router();
const cache = new NodeCache({
    stdTTL: 0, // Items will not expire by default
    checkperiod: 600 // Check for expired items every 10 minutes
});

router.get("/:moduleId", (req, res) => {
    const gameId = req.gameId; // Retrieve gameId from the request object
    const moduleId = req.params.moduleId; // Retrieve moduleId from the request object
    
    console.log("GameId:", gameId);
    console.log("moduleId:", moduleId);

    //fetchModDetails(gameId, moduleId, res);
    //console.log("moduleId:", moduleId);

    if (!gameId) {
        return res.status(400).send({ error: "GameId is required" });
    }

    // First check for cached game data
    const cachedGameData = cache.get(gameId);

    cachedGameData ? console.log("Game Cache hit") : fetchGameDetails(gameId, res);
    
    const moduleData = cachedGameData.modulesImported?.[moduleId];

    moduleData ? console.log(moduleData) : console.log("Module not found");


    
    const ref = db.ref("GameDetails/" + gameId);
    ref
        .once("value")
        .then(snapshot => {
            const gameData = snapshot.val();
            cache.set(gameId, gameData);
            const moduleData = gameData.modulesImported?.[moduleId];
            if (moduleData) {
                res.status(200).send(moduleData);
            } else {
                res.status(404).send({ error: "Module not found" });
            }
        })
        .catch(error => {
            console.error("Error fetching game data:", error);
            res.status(400).send(error);
        });
});

export default router;
