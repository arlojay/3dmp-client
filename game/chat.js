class Chat {
    constructor(client) {
        this.client = client;

        this.chatInput = document.querySelector("#chat-input");
        this.chatLogs = document.querySelector("#chat-history");

        this.chatInput.addEventListener("submit", e => {
            e.preventDefault();

            this.send(new FormData(this.chatInput).get("text"));
            this.chatInput.querySelector('input[name="text"]').value = "";
        });
    }
    send(text) {
        if(text.startsWith("/exec ")) return this.addMessage(JSON.stringify(window.eval(text.slice(6))));
        this.client.sendMessage(text);
    }

    addMessage(text) {
        const element = document.createElement("li");
        element.textContent = text;

        this.chatLogs.appendChild(element);
        this.chatLogs.clientHeight;
        this.chatLogs.scrollTop = this.chatLogs.scrollHeight;
    }
}

export default Chat;