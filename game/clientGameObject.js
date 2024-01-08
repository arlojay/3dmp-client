import { Euler, Vector3 } from "three";
import MathEx from "./MathEx.js";

class ClientGameObject {
    constructor(data) {
        this.raw = data;
        this.id = "";
        this.mesh = null;

        this.position = new Vector3();
        this.rotation = new Euler();
    }

    handleDataChange(id, value) {
        if(id == "position") {
            this.position.set(...value);
        }
        if(id == "rotation") {
            this.rotation.set(...value.slice(0, 3));
            this.rotation.order = value[3];
            this.mesh.rotation.order = value[3];
        }
    }

    update(dt) {
        const alpha = 1 - (0.5 ** (dt * 60));

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