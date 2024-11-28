import express from "express";
import db from "../firebaseConfig.js";
import NodeCache from "node-cache";

const router = express.Router();
const cache = new NodeCache({
    stdTTL: 0, // Items will not expire by default
    checkperiod: 600 // Check for expired items every 10 minutes
});

//check for cached monster
//check for cached game data
// else cache game data
//then check for monster data in cached game data
//else check if installed modules exist
//if so, fetch module data
//then check for monster data in cached game data
//else check core assets archive for monster data
//else monster ${monsterId} not found   

router.get("/:monsterId", (req, res) => {
    const gameId = req.gameId; // Retrieve gameId from the request object
    const monsterId = req.params.monsterId; // Retrieve monsterId from the request object
    
    console.log("GameId:", gameId);
    console.log("MonsterId:", monsterId);

    if (!gameId) {
        return res.status(400).send({ error: "GameId is required" });
    }

    if (!monsterId) {
        return res.status(400).send({ error: "MonsterId is required" });
    }

    // First check for cached game data
    const cachedGameData = cache.get(gameId);

    if (cachedGameData) {
        console.log("Game Cache hit");

        // Check for monster data in cached game data
        const monsterData = cachedGameData.assets?.monsters?.[monsterId];
        if (monsterData) {
            return res.status(200).send(monsterData);
        } else {
            return searchModData(cachedGameData, monsterId, res);
        }
    } else {
        console.log("monster.js - Fetching game data for game ID:", gameId);
        let monsterData = null;
        const ref = db.ref("GameDetails/" + gameId);
        ref
            .once("value")
            .then(snapshot => {
                const gameData = snapshot.val();
                cache.set(gameId, gameData);
                const R = gameData.assets?.monsters?.[monsterId];
                if (monsterData) {
                    return res.status(200).send(monsterData);
                } else {
                    return searchModData(gameData, monsterId, res);
                }
            })
            .catch(error => {
                console.error("Error fetching game data:", error);
                return res.status(400).send(error);
            });
    }
});

const searchModData = (gameData, monsterId, res) => {
    // If not found in game cache, check to see if modules installed 
    console.log("Searching for modules");
    var listModulesVersionId = [];
    //loop through modulesImported and push versionId to listModules
    if (gameData.modulesImported && typeof gameData.modulesImported === 'object') {
        Object.values(gameData.modulesImported).forEach(value => {
            listModulesVersionId.push(value.versionid);
        });
    console.log("List of Modules:", listModulesVersionId);
    }        

    // Loop through listModules and fetch module data
    listModulesVersionId.forEach(mod => {
        // Get the module data from cache
        const cachedModuleData = cache.get(mod);

        // If there is no module data in cache, fetch module data & save to cache
        if (!cachedModuleData) {
            console.log("Fetching module data for module ID:", mod);
            const ref = db.ref("ModuleVersions/" + mod + "/streamed");
            ref.once("value")
                .then(snapshot => {
                    const moduleData = snapshot.val();
                    console.log("Module Data:", moduleData);
                    cache.set(mod, moduleData);

                    // Check for monster data in fetched module data
                    const monsterData = moduleData?.monsters?.[monsterId];
                    if (monsterData) {
                        return res.status(200).send(monsterData);
                    } else {
                        searchModData(monsterId, res);
                    }
                })
                .catch(error => {
                    console.error("Error fetching module data:", error);
                });
        } else {
            // Check for monster data in cached module data
            const monsterData = cachedModuleData?.monsters?.[monsterId];
            if (monsterData) {
                return res.status(200).send(monsterData);
            } else {
                searchModData(monsterId, res);
            }
        }
    });
};

const searchCoreAssetsArchive = (monsterId, res) => {
    // If not found in game cache, check to see if modules installed 
    console.log("Searching for monsters in core assets");
    const ref = db.ref("CoreAssetsArchive/monsters/" + monsterId);
    ref.once("value")
        .then(snapshot => {
            const monsterData = snapshot.val();
            if (monsterData) {
                cache.set(monsterId, monsterData);
                return res.status(200).send(monsterData);
            } else {
                return res.status(404).send({ error: "Monster not found" });
            }
        })
        .catch(error => {
            console.error("searchCoreAssetsArchive - Error fetching monster data:", error);
            return res.status(400).send(error);
        });
    }

export default router;
