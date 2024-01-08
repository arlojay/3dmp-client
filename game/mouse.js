import SerialBus from "./serialBus.js";

class Mouse extends SerialBus {
    constructor(element) {
        super();
        this.element = element;

        this._leftDown = false;
        this._rightDown = false;
        this._middleDown = false;
        this.x = 0;
        this.y = 0;

        this.enabled = true;
        this.lockedBefore = false;

        element.addEventListener("mousemove", e => this.mouseUpdate(e, "move"));
        element.addEventListener("mousedown", e => this.mouseUpdate(e, "down"));
        element.addEventListener("mouseup", e => this.mouseUpdate(e, "up"));
    }

    get leftDown() {
        if(!this.enabled) return false;
        return this._leftDown;
    }
    get rightDown() {
        if(!this.enabled) return false;
        return this._rightDown;
    }
    get middleDown() {
        if(!this.enabled) return false;
        return this._middleDown;
    }

    isLocked() {
        return document.pointerLockElement != null;
    }

    unlock() {
        if(!this.enabled) return;

        document.exitPointerLock();
        this.lockedBefore = false;
    }

    lock() {
        if(!this.enabled) return;

        this.lockedBefore = true;
        return new Promise(async (res, rej) => {
            await this.element.requestPointerLock({
                unadjustedMovement: true
            });

            const changeCallback = e => {
                if(document.pointerLockElement != this.element) {
                    if(this.enabled) this.lockedBefore = false;
                    this.element.removeEventListener("pointerlockchange", changeCallback);
                    res();
                }
            }

            this.element.addEventListener("pointerlockchange", changeCallback);
        })
    }

    mouseUpdate(event, type) {
        this._leftDown = !!(event.buttons & 1);
        this._rightDown = !!(event.buttons & 2);
        this._middleDown = !!(event.buttons & 4);

        this.x = event.clientX;
        this.y = event.clientY;

        switch(type) {
            case "move":
                if(this.enabled) {
                    this.emit("mousemove", [this.x, this.y]);
                    if(this.isLocked()) this.emit("mousemovelocked", [ event.movementX, event.movementY ]);
                }
                break;
            case "down":
                if(this.enabled) this.emit("mousedown", event.button);
                break;
            case "up":
                if(this.enabled) this.emit("mouseup", event.button);
                break;
        }
    }

    enable() {
        this.enabled = true;
        if(this.lockedBefore) {
            this.lock();
            this.lockedBefore = false;
        }
    }

    disable() {
        this.enabled = false;
        this.unlock();
    }
}

export default Mouse;