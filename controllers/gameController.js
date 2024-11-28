import db from "../firebaseConfig.js";

const fetchGameDetails = async (gameId) => {
    try {
        const ref = db.ref("GameDetails/" + gameId);
        const snapshot = await ref.once("value");
        const gameData = snapshot.val();
        return gameData;
    } catch (error) {
        console.error("Error fetching game data:", error);
        throw error;
    }
};

export default fetchGameDetails;
