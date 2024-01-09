import { ObjectLoader, Scene } from "three";
import Socket from "./socket.js";

class Client {
    constructor(socket) {
        /**
         * @type { Socket }
         */
        this.socket = socket;
    }

    async getLevel() {
        return await this.socket.execute("get-level");
    }

    setPlayerPosition(position) {
        this.socket.send("set-player-position", [position.x, position.y, position.z]);
    }
    setPlayerRotation(rotation) {
        this.socket.send("set-player-rotation", [rotation.x, rotation.y, rotation.z, rotation.order]);
    }

    sendKey(key) {
        this.socket.send("key", key);
    }

    sendMessage(message) {
        this.socket.send("message", message);
    }
}

export default Client;