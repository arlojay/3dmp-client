import { Euler, Vector3 } from "three";
import MathEx from "./mathEx.js";

let pollingRate = 30;
class ClientGameObject {
    static setPollingRate(newValue) {
        pollingRate = newValue;
    }

    constructor(data) {
        this.raw = data;
        this.id = "";
        this.mesh = null;

        this.moved = false;
        this.rotated = false;

        this.position = new Vector3();
        this.rotation = new Euler();
    }

    handleDataChange(id, value) {
        if(id == "position") {
            this.position.set(...value);

            // Snap the object immediately if first movement packet
            if(!this.moved) {
                this.mesh.position.set(...value);
                this.moved = true;
            }
        }
        if(id == "rotation") {
            this.rotation.set(...value.slice(0, 3));
            this.rotation.order = value[3];
            this.mesh.rotation.order = value[3];

            // Snap the object immediately if first rotation packet
            if(!this.rotated) {
                this.mesh.rotation.set(...value);
                this.rotated = true;
            }
        }
    }

    update(dt) {
        const alpha = 1 - (0.5 ** (dt * pollingRate));

        this.mesh.position.lerp(this.position, alpha);
        this.mesh.rotation.set(
            MathEx.lerp(this.mesh.rotation.x, this.rotation.x, alpha),
            MathEx.lerp(this.mesh.rotation.y, this.rotation.y, alpha),
            MathEx.lerp(this.mesh.rotation.z, this.rotation.z, alpha)
        );
    }

    async load(objectLoader) {
        const { position, rotation, mesh, id } = this.raw;
        
        const loadedMesh = await objectLoader.parseAsync(mesh);

        this.id = id;
        this.mesh = loadedMesh;

        this.handleDataChange("position", position);
        this.handleDataChange("rotation", rotation);
    }
}

export default ClientGameObject;