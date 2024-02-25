import { Move } from "./ConquidBoard"

export interface JoinGameResponse {
    moves: Array<Move>
    players: string[]
}
