import Keyboard from "./keyboard.js";
import Mouse from "./mouse.js";
import SerialBus from "./serialBus.js";

class Controls extends SerialBus {
    constructor(element, mouseElement = element) {
        super();

        this.keyboard = new Keyboard(element);
        this.mouse = new Mouse(mouseElement);

        this.keyboard.merge(this);
        this.mouse.merge(this);

        this.enabled = true;
    }

    enable() {
        this.enabled = true;
        this.keyboard.enable();
        this.mouse.enable();
    }
    disable() {
        this.enabled = false;
        this.keyboard.disable();
        this.mouse.disable();
    }
}

export default Controls;