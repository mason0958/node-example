// Global variables
var canvas, engine, scene, camera, score = 0;
var TOAD_MODEL;

// An array to store each ending of the lane
var ENDINGS = [];
var ENEMIES  = [];

/**
* Load the scene when the canvas is fully loaded
*/
document.addEventListener("DOMContentLoaded", function () {
    if (BABYLON.Engine.isSupported()) {
        initScene();
    }
}, false);



/**
 * Creates a new BABYLON Engine and initialize the scene
 */
function initScene() {
    // Get canvas
    canvas = document.getElementById("renderCanvas");

    // Create babylon engine
    engine = new BABYLON.Engine(canvas, true);

    // Create scene
    scene = new BABYLON.Scene(engine);

    // The box creation
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);

    // The sky creation
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/cubemap/cubemap", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // box + sky = skybox !
    skybox.material = skyboxMaterial;

    // Create the camera
    camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,4,-13), scene);
    camera.setTarget(new BABYLON.Vector3(0,0,10));
    camera.attachControl(canvas);

    // Create light
    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(0,5,-5), scene);
    
    initGame();

    engine.runRenderLoop(()=> {
        scene.render();
        ENEMIES.forEach(function (shroom) {
            if (shroom.killed) {
                // Nothing to do here
            } else {
                shroom.position.z -= 0.5;
            }
        });

        cleanShrooms();
    });
}


function initGame() {

    // BABYLON.Mesh.CreateSphere("sphere", 10, 1, scene);
    
    var ground = new BABYLON.StandardMaterial("ground", scene);
    var texture = new BABYLON.Texture("assets/textures/ground.jpg", scene);
    texture.uScale = 40;
    texture.vScale = 2;
    ground.diffuseTexture = texture;    

    // Number of lanes
    var LANE_NUMBER = 3;
    // Space between lanes
    var LANE_INTERVAL = 5;
    var LANES_POSITIONS = [];

    // Function to create lanes
    var createLane = function (id, position) {
        var lane = BABYLON.Mesh.CreateBox("lane"+id, 1, scene);
        lane.scaling.y = 0.1;
        lane.scaling.x = 3;
        lane.scaling.z = 800;
        lane.position.x = position;
        lane.position.z = lane.scaling.z/2-200;
        lane.material = ground;
    };

    var createEnding = function (id, position) {
        var ending = BABYLON.Mesh.CreateGround(id, 3, 4, 1, scene);
        ending.position.x = position;
        ending.position.y = 0.1;
        ending.position.z = 1;
        var mat = new BABYLON.StandardMaterial("endingMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.8,0.2,0.2);
        ending.material = mat;
        return ending;
    };

    var currentLanePosition = LANE_INTERVAL * -1 * (LANE_NUMBER/2);
    for (var i = 0; i<LANE_NUMBER; i++){
        LANES_POSITIONS[i] = currentLanePosition;
        createLane(i, currentLanePosition);
        var e = createEnding(i, currentLanePosition);
        ENDINGS.push(e);
        currentLanePosition += LANE_INTERVAL;
    }

    BABYLON.SceneLoader.ImportMesh("red_toad", "assets/toad/", "toad.babylon", scene, (meshes)=> {
        var m = meshes[0];
        m.isVisible = false;
        m.scaling = new BABYLON.Vector3(0.5,0.5,0.5);
        TOAD_MODEL = m;
    });

    // Adjust camera position
    camera.position.x = LANES_POSITIONS[Math.floor(LANE_NUMBER/2)];

    var createEnemy = function () {
        // The starting position of toads
        var posZ = 100;

        // Get a random lane
        var posX = LANES_POSITIONS[Math.floor(Math.random() * LANE_NUMBER)];

        // Create a clone of our template
        var shroom = TOAD_MODEL.clone(TOAD_MODEL.name);

        shroom.id = TOAD_MODEL.name+(ENEMIES.length+1);
        // Our toad has not been killed yet !
        shroom.killed = false;
        // Set the shroom visible
        shroom.isVisible = true;
        // Update its position
        shroom.position = new BABYLON.Vector3(posX, shroom.position.y/2, posZ);
        ENEMIES.push(shroom);
    };

    // Creates a clone every 1 seconds
    setInterval(createEnemy, 1000);

}


function cleanShrooms() {
    // For all clones
    for (var n=0; n<ENEMIES.length; n++) {
        // The mushrooms has been killed !
        if (ENEMIES[n].killed) {
            var shroom = ENEMIES[n];
            // Destroy the clone !
            shroom.dispose();
            ENEMIES.splice(n, 1);
            n--;
            // Add one point to the score
            score += 1;
        }
        // The mushrooms is behind the camera
        else if (ENEMIES[n].position.z < -10) {
            var shroom = ENEMIES[n];
            // Destroy the clone !
            shroom.dispose();
            ENEMIES.splice(n, 1);
            n--;
            // Remove one point to the score
            score -= 1;
        }
    }
}


function animateEnding (ending) {
    // Get the initial position of our mesh
    var posY = ending.position.y;
    // Create the Animation object
    var animateEnding = new BABYLON.Animation(
    "animateEnding",
    "position.y",
    60,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);

    // Animations keys
    var keys = [];
    keys.push({
        frame: 0,
        value: posY
    },{
        frame: 5,
        value: posY+0.5
    },{
        frame: 10,
        value: posY
    });

    // Add these keys to the animation
    animateEnding.setKeys(keys);

    // Link the animation to the mesh
    ending.animations.push(animateEnding);

    // Run the animation !
    scene.beginAnimation(ending, 0, 10, false, 1);

}

window.addEventListener("keydown", (evt)=> {
    var currentEnding = -1;
    switch (evt.keyCode) {
        case 65 : //'A'
            currentEnding = 0;
            break;
        case 90 : //'Z'
            currentEnding = 1;
            break;
        case 69 : //'E'
            currentEnding = 2;
            break;
    }
    if (currentEnding != -1) {
        animateEnding(ENDINGS[currentEnding]);
        var shroom = getToadOnEnding(ENDINGS[currentEnding]);
        if (shroom) {
            // Kill !
            shroom.killed = true;
        }
    }
});


// Function checking if a shroom is present on a given ending
function getToadOnEnding(ending) {
    // for each mushroom
    for (var i=0; i<ENEMIES.length; i++){
        var shroom = ENEMIES[i];
        // Check if the shroom is on the good lane
        if (shroom.position.x === ending.position.x) {

            // Check if the shroom is ON the ending
            var diffSup = ending.position.z + 3;
            var diffInf = ending.position.z - 3;

            if (shroom.position.z > diffInf && shroom.position.z < diffSup ) {
                return shroom;
            }
        }
    }
    return null;
}


