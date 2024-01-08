import SerialBus from "./serialBus.js";

class Keyboard extends SerialBus {
    constructor(element) {
        super();

        this.element = element;
        this.keys = new Set();
        this.combos = [];
        this.executedCombos = [];

        this.enabled = true;

        element.addEventListener("keydown", e => {
            if(e.repeat) return;

            const key = this.translateKey(e.key);

            if(this.enabled) {
                this.emit("pre_keydown", {
                    origin: e,
                    key,
                    control: e.ctrlKey, alt: e.altKey, shift: e.shiftKey,
                    preventDefault: () => e.preventDefault()
                });
            }


            this.keys.add(key);

            if(this.enabled) {
                this.emit("keydown", key);
                this.emit("keydown_" + key);
            }

            this.checkCombos();
        });
        element.addEventListener("keyup", e => {
            const key = this.translateKey(e.key);
            this.keys.delete(key);

            if(this.enabled) {
                this.emit("keyup", key);
                this.emit("keyup_" + key);
            }

            if(this.keys.size == 0) this.combos.splice(0);
        });

        if(navigator?.keyboard != null) {
            navigator.keyboard.lock();
        }
    }

    checkCombos() {
        outer:for(const combo of this.combos) {
            for(const key of combo.keys) {
                if(key.length > 1 && key.startsWith("!")) {
                    if(this.keyDown(key.slice(1))) continue outer;
                } else {
                    if(!this.keyDown(key)) continue outer;
                }
            }

            if(this.enabled) {
                this.emit(combo.id);
            }
            this.executedCombos.push(combo.id);
        }
    }

    addKeyCombo(keys, id) {
        this.combos.push({ keys, id });
    }

    translateKey(key) {
        if(key == " ") return "SPACE";

        return key.toUpperCase();
    }

    keyDown(key) {
        if(!this.enabled) return false;
        return this.keys.has(this.translateKey(key));
    }

    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
}

export default Keyboard;