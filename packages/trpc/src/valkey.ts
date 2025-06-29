import Valkey from "iovalkey";

const tasksQueue = "tasks"

export async function publishFensTask(valkey: Valkey,gameId: string ,moves: string[]) {
    const message = {
        type: "fens",
        state: {
            gameId: gameId
        },
        payload: {
            moves: moves
        }
    }

    await valkey.lpush(tasksQueue, JSON.stringify(message))
}


export async function publishLinesTask(valkey: Valkey,gameId: string , gameTurn: number, fen: string) {
    const message = {
        type: "lines",
        state: {
            gameId: gameId,
            gameTurn: gameTurn 
        },
        payload: {
            fen: fen
        }
    }

    await valkey.lpush(tasksQueue, JSON.stringify(message))
}