import SerialBus from "./serialBus.js";

class Socket extends SerialBus {
    constructor(url) {
        super();
        this.url = url.startsWith("http") ? url.replace("http", "ws") : url;
        this.nonce = 0;

        this.open = false;
    }

    connect() {
        if(this.socket) this.socket.close();
        this.socket = new WebSocket(this.url);
        this.initSocketHandlers();
        this.emit("connecting");
    }

    send(type, content) {
        if(!this.open) throw new Error("Cannot send a message with a closed socket");
        this.socket.send(JSON.stringify({ type, content }));
    }

    async execute(type, content) {
        if(!this.open) throw new Error("Cannot send a message with a closed socket");
        const nonce = this.nonce++;

        this.socket.send(JSON.stringify({ type, content, nonce }));

        return await new Promise(res => {
            const callback = (content, extra) => {
                if(extra.nonce != nonce) return;

                this.off(type, callback);
                res(content);
            };

            this.on(type, callback);
        });
    }

    initSocketHandlers() {
        this.socket.addEventListener("message", event => {
            const data = JSON.parse(event.data);
            const { type, content } = data;

            this.emit(type, content, data);
        });
        this.socket.addEventListener("close", () => {
            this.emit("close");
            this.open = false;
            this.socket = null;
        });
        this.socket.addEventListener("error", error => {
            this.emit("error", error);
        });
        this.socket.addEventListener("open", () => {
            this.open = true;
            this.emit("open");
        });
    }
}

export default Socket;