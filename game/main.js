import { Euler, ObjectLoader, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import Socket from "./socket.js";
import Client from "./client.js";
import Controls from "./controls.js";
import ClientGameObject from "./clientGameObject.js";
import Chat from "./chat.js";

const renderer = new WebGLRenderer({ canvas: document.querySelector("canvas") });
const camera = new PerspectiveCamera(90, 1, 0.01, 3000);
const cameraControls = new PointerLockControls(camera, renderer.domElement);
const objectLoader = new ObjectLoader();
let scene = new Scene();

window.camera = camera;

/**
 * @type { Controls }
*/
let controls;

let client, chat;
const gameObjects = new Map();


init();


let lastTime = 0;
function render(time) {
    const dt = Math.min(100, time - lastTime) * 0.001;
    lastTime = time;

    for(const gameObject of gameObjects.values()) {
        gameObject.update(dt);
    }


    let speed = 100;
    let moved = false;

    if(controls.mouse.isLocked()) {
        if(controls.keyboard.keyDown("shift")) {
            speed *= 2;
        }

        if(controls.keyboard.keyDown("w")) {
            cameraControls.moveForward(dt * speed);
            moved = true;
        }
        if(controls.keyboard.keyDown("s")) {
            cameraControls.moveForward(dt * -speed);
            moved = true;
        }
        if(controls.keyboard.keyDown("a")) {
            cameraControls.moveRight(dt * -speed);
            moved = true;
        }
        if(controls.keyboard.keyDown("d")) {
            cameraControls.moveRight(dt * speed);
            moved = true;
        }
        if(controls.keyboard.keyDown("e")) {
            camera.position.add(new Vector3(0, dt * speed, 0));
            moved = true;
        }
        if(controls.keyboard.keyDown("q")) {
            camera.position.add(new Vector3(0, dt * -speed, 0));
            moved = true;
        }
    }

    if(moved) {
        client.setPlayerPosition(camera.position);
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}
function resize() {
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
}
async function init() {
    resize();
    window.addEventListener("resize", resize);

    controls = new Controls(document.body, renderer.domElement);
    controls.on("mousedown", button => {
        controls.mouse.lock();
    });

    controls.on("mousemovelocked", delta => {
        camera.rotation.add(new Euler(delta[1] * 0.003, delta[0] * 0.003, 0));
        
        client.setPlayerRotation(camera.rotation);
    });
    controls.on("keydown", key => {
        if(key == "e") {
            client.sendKey("e");
        }
        if(key == "f") {
            client.sendKey("f");
        }
        if(key == "r") {
            client.sendKey("r");
        }
        if(key == "g") {
            client.sendKey("g");
        }
    })
    
    camera.rotation.order = "ZYX";
    camera.position.set(30, 20, 40);
    camera.lookAt(new Vector3(0, 0, 0));

    requestAnimationFrame(render);

    await connect();

    

    client.socket.on("game-object-change", data => {
        const gameObject = gameObjects.get(data.objectId);
        if(gameObject == null) {
            console.warn("Recieved a change packet for an object that doesn't exist yet (" + data.objectId + ")");
            return;
        }

        for(const change of data.changes) {
            gameObject.handleDataChange(change.id, change.value);
        }
    });
    client.socket.on("add-object", async data => {
        const gameObject = await createGameObject(data);
        scene.add(gameObject.mesh);
    });
    client.socket.on("remove-object", async id => {
        const gameObject = gameObjects.get(id);

        gameObjects.delete(id);
        scene.remove(gameObject.mesh);
    });
    client.socket.on("player-camera-position", data => {
        camera.position.set(...data);
    });
    client.socket.on("player-camera-rotation", data => {
        camera.rotation.set(...data);
    });
    client.socket.on("message", message => {
        chat.addMessage(message);
    });
}
async function connect() {
    const socket = new Socket(atob(new URLSearchParams(document.location.search).get("d")));
    socket.connect();
    client = new Client(socket);
    chat = new Chat(client);
    
    socket.on("close", () => {
        setTimeout(() => {
            socket.connect();
        }, 1000);
    });
    socket.on("open", () => {
        onConnected();
    });
    await socket.onOnceSync("open");
}

async function onConnected() {
    const data = await client.getLevel();
    
    scene = new Scene();

    ClientGameObject.setPollingRate(data.globals.pollingRate);

    for await (const object of data.world) {
        const gameObject = await createGameObject(object);
        scene.add(gameObject.mesh);
    }
}

async function createGameObject(data) {
    const gameObject = new ClientGameObject(data);
    await gameObject.load(objectLoader);

    gameObjects.set(gameObject.id, gameObject);

    return gameObject;
}