import db from "../firebaseConfig.js";
import NodeCache from "node-cache";

const cache = new NodeCache({
    stdTTL: 0, // Items will not expire by default
    checkperiod: 600 // Check for expired items every 10 minutes
});

//First check in game cache
    //check for game cache data
    //If not in game cache, fetch game data
    //Once we have game data check for object data in assets/objectTables/${dir}/table/${objectId}
    // What if we can't find the game? Should we see if we can find the object in the serverstorage for core assets?

// Second check in mod cache
    // If not found in game cache, check to see if modules installed 
    // If no modules are installed, return 404
    // Loop through listModules and fetch cached module data
    // If not in cached Module Data, Loop through listModules and fetch module data
    // Once we have cached Module Data, search for object data 

// Third check in core assets archive on Server
    //If the object is not found in the game cache or the mod cache, check the core assets archive on the server

// Fourth return 404


const searchObjectData = (gameId, dir, objectId, res) => {
    // If not found in game cache, check to see if modules installed 
    // check for game cache data
    const gameData = cache.get(gameId);
    
    if (!gameData) {
        console.log("Fetching game data for gameId:", gameId);
        const ref = db.ref("GameDetails/" + gameId);
        ref.once("value")
            .then(snapshot => {
                gameData = snapshot.val();
                cache.set(gameId, gameData);
                console.log("Game Data:", gameData);    
            })

    var listModulesVersionId = [];
    //loop through modulesImported and push versionId to listModules
    if (gameData.modulesImported && typeof gameData.modulesImported === 'object') {
        Object.values(gameData.modulesImported).forEach(value => {
            listModulesVersionId.push(value.versionid);
        });
    console.log("List of Modules:", listModulesVersionId);
    }      
       
    // If no modules are installed, return 404
    if(listModulesVersionId.length === 0){
        return res.status(404).send({ error: "No installed mods for game", gameId });
    }

    // Loop through listModules and fetch module data
    const getCachedModules = listModulesVersionId.forEach(mod => {
        const cachedModuleData = cache.get(mod);
    });
    if (!cachedModuleData) {
    // Loop through listModules and fetch module data
    const fetchModuleData = listModulesVersionId.forEach(mod => {
        console.log("Fetching module data for module ID:", mod);
        const ref = db.ref("ModuleVersions/" + mod + "/streamed");
        ref.once("value")
            .then(snapshot => {
                const moduleData = snapshot.val();
                console.log("Module Data:", moduleData);
                cache.set(mod, moduleData);
            })
            .catch(error => {
                console.error("Error fetching module data:", error);
            });
    }); }

    const seachCachedModules = listModulesVersionId.forEach(mod => {
        const objectData = moduleData?.streamed?.assets?.objectTables?.[dir]?.[objectId];
        if (objectData) {
            return res.status(200).send(objectData);
        } else {
            console.error("Error finding object data:", error);
        }
        });
};
}

export default searchObjectData;
