if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}

var container;

//not triggered by layer change
var camera, controls, scene, raycaster, renderer;
var lighting, ambient, keyLight, fillLight, backLight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var numModels = 13;
var testArray = [];

//indicate current layer
var layer = "one";

//check or change with each render, layer 1
//6.9 loads model centered
var initialtheta = 6.9;
var theta = initialtheta;
var targetTheta;
var pause = false;
var revolveDirection = "left";
var revolveClicked = false;


//check or change when layer changes
var firstOpen;
var bustOn;
var allBustsOn = true;
var autoRotate = true;
var rotateAligned = false;
var elem;
var leftelem;
var baseelem;
var centerelem;
// var evt;
var m;

//for rotating bust
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};


function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    /* Camera */

    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 0.5;
    camera.position.y = 0.03;
    camera.position.z = 3.5;

    /* Scene */

    scene = new THREE.Scene();
    lighting = false;

    ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);

    fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
    fillLight.position.set(100, 0, 100);

    backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();


    /* Generate 13 busts */
    var paths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
        .map(function(value) {
            return "assets/2014-AO-" + value + "/";
        });

    function loadNextPath() {
        var pathToLoad = paths.pop();
        if (!pathToLoad) {
            console.log("OK THERE SHOULD BE NO ANIMATES BEFORE THIS LINE!");
            animate();
            document.getElementById("loadingOverlay").style.display="none";
        } else {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setBaseUrl(pathToLoad);
            mtlLoader.setPath(pathToLoad);                       
            mtlLoader.load('model_mesh.obj.mtl', function (materials) {
                materials.preload();
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath(pathToLoad);
                objLoader.load('model_mesh.obj', function (obj) {
                    testArray.push(obj);
                    scene.add(obj);  
                    loadNextPath(); 
                });
            });
        }
    }

    loadNextPath();

    

    /* Vectors */
    raycaster = new THREE.Raycaster();

    /* Renderer */
    var canvas = document.getElementById("canvasID");
    renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xffffff)); //2a6489
    //console.log(renderer.domElement);
    container.appendChild(renderer.domElement);

    /* Events */

    window.addEventListener('resize', onWindowResize, false);

    //for dragging/rotating bust
    document.getElementById("imgDisplay").onmousedown = function() {mouseDown()};
    document.getElementById("imgDisplay").onmousemove = function() {mouseMove(event)};
    document.getElementById("imgDisplay").onclick = function() {mouseDragOff()};

    document.getElementById("canvasID").onclick = function() {onCanvasClick(event)};
    
    document.getElementById("closeButton").onclick = function() {goBackToLayerOne();};
    document.getElementById("title").onclick = function() {goBackToLayerOne();};
    document.onkeydown = checkKey;

    //2D | 3D options
    document.getElementById("twod").onclick = function() {display2DScan();};
    document.getElementById("threed").onclick = function() {display3DScan();};

    //info panel
    document.getElementById("infoButton").onclick = function() {toggleInfoPanel();};
    

    // var centerline = document.getElementById("centerLine");
    // centerline.style.marginLeft = windowHalfX + "px";
    //magnifier
    var evt = new Event();
    m = new Magnifier(evt);

    
    //stats
    // javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.getElementById("stats").appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()   
}

window.onload = function() {
  init();
};


function mouseDown() {
    isDragging = true; 
    autoRotate = false; 
}

function mouseMove(e) {
    //console.log(e);
    var deltaMove = {
        x: e.offsetX-previousMousePosition.x,
        y: e.offsetY-previousMousePosition.y
    };
    if(isDragging) {
        var deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                0,
                toRadians(deltaMove.x * 1),
                0,
                'XYZ'
            ));
        
        testArray[bustOn].quaternion.multiplyQuaternions(deltaRotationQuaternion, testArray[bustOn].quaternion);
    }
        
    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
} 

function mouseDragOff() {
    if (isDragging == true) {
        isDragging = false;
    } 
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '37' && revolveClicked == false) {
        revolveDirection = "right";
        findTargetTheta();
        revolveClicked = true;
    } else if (e.keyCode == '39' && revolveClicked == false) {
        revolveDirection = "left";
        findTargetTheta();
        revolveClicked = true;
    }
}


function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();            
    renderer.setSize(window.innerWidth, window.innerHeight); 
    // var previewWidth = document.getElementById("preview").clientWidth;
    // document.getElementById("preview").style.height = previewWidth*1.3775 + "px";
    // if (window.innerHeight < 700) {
    //     console.log("height is less than 700");
    // } else {
        
    // }
    

}

function turnOnLights() {
    ambient.intensity = 0.35;
    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);
}

function turnOffLights() {
    ambient.intensity = 1.0;
    scene.remove(keyLight);
    scene.remove(fillLight);
    scene.remove(backLight);
}

function onCanvasClick( event ) {
    //console.log("canvas clicked");
    
    var xClick = event.clientX;

    if (layer == "one" && (xClick > (0.33*window.innerWidth)) && (xClick < ((0.66*window.innerWidth))) ){
        //console.log("go to layer 2");
        layer = "two";
        firstOpen = true; //so that this first click doesnt trigger layer 3

    } 
    if (layer == "one" && (xClick < windowHalfX) && revolveClicked == false) {
        //switch bc we assume if someone clicks on the model 
        //on the left it should move towards them
        revolveDirection = "right";
        findTargetTheta();
        revolveClicked = true;
        } 
    if (layer == "one" && (xClick >= windowHalfX) && revolveClicked == false) {
        //rotate right
        revolveDirection = "left";
        findTargetTheta();
        revolveClicked = true;
    }
}

function goBackToLayerOne() {            
    if (baseelem) {
        baseelem.style.display = "none";   
    }
    if (elem) {
        elem.style.display = "none";   
    }
    if (leftelem) {
        leftelem.style.display = "none";   
    }
    if (centerelem) {
        centerelem.style.display = "none";   
    }

    turnOnAllBusts();
    autoRotate = true;
    revolveDirection = "left";
    layer = "one";
    pause = false;
    rotateAligned = false;
}

/* Core Animate Render Functions */

function animate() {
    //console.log('called animate!');
    requestAnimationFrame(animate);
    render();
}

//fix so that if only one bust is open the others arent being rendered
function render() {
    //console.log(theta);
    if (pause == false && layer == "one") {
        updateRevolution();   
    } 

    if (revolveClicked == true && layer == "one") {
        rotateOneBustInterval();
    } 

    if (layer == "two") {
        firstOpen = false;
        layerTwoUI();   
    }
    
    renderer.render(scene, camera);
}

/* Update Frame Functions */
function layerTwoUI() {
    if (allBustsOn == true) {
        isolateOneBust();
        openInfoPanel();

        // m.attach({
        //     thumb: '#thumb',
        //     large: 'assets/2d-scan.png',
        //     largeWrapper: 'preview',
        //     mode: 'outside'
        // });

    } else {
        if (autoRotate == true) {
            testArray[bustOn].rotation.y -= 0.003;   
        }                
    }
}

function display2DScan() {
    testArray[bustOn].visible = false;
    document.getElementById("twoD-scan").style.display = "block";
    document.getElementById("twod").style.fontFamily = "Avenir-Heavy";
    document.getElementById("threed").style.fontFamily = "Avenir-Book";
}

function display3DScan() {
    testArray[bustOn].visible = true;
    document.getElementById("twoD-scan").style.display = "none";
    document.getElementById("threed").style.fontFamily = "Avenir-Heavy";
    document.getElementById("twod").style.fontFamily = "Avenir-Book";
}

function toggleInfoPanel() {
    console.log("clicked info");
    // var status = document.getElementById("infoPanel").style.display;
    console.log(document.getElementById("infoPanel").style.display);
    if (document.getElementById("infoPanel").style.display == "none" || document.getElementById("infoPanel").style.display == "") {
        console.log("display block");
        document.getElementById("infoPanel").style.display = "block";
    } else if (document.getElementById("infoPanel").style.display != "none") {
        console.log("display none");
        document.getElementById("infoPanel").style.display = "none";
    }

}

function isolateOneBust() {
    //define bustOn to be the center one based on max z position value
    pause = true;
    bustOn = findClosestBust();
    testArray[bustOn].position.x = 0.5;
    //testArray[bustOn].position.x = 0.5;
    turnOffOtherBusts(bustOn); 
}

function findClosestBust() {
    var closestBust;
    var closestZ = 0;
    for (var i = testArray.length - 1; i >= 0; i--) {
        //console.log(testArray[i].position.z);   
        if (testArray[i].position.z > closestZ) {
            closestZ = testArray[i].position.z;
            closestBust = i;
        }
    }
    return closestBust;
}

function openInfoPanel() {
    elem = document.getElementById('rightblock');
    baseelem = document.getElementById('layer2block');
    leftelem = document.getElementById('leftblock');
    centerelem = document.getElementById('centerblock');
    elem.style.display = 'block';
    baseelem.style.display = 'block';
    leftelem.style.display = 'block';
    centerelem.style.display = 'block';
    // var previewWidth = document.getElementById("preview").clientWidth;
    // document.getElementById("preview").style.height = previewWidth*1.3775 + "px";
    // console.log(document.getElementById("preview").style.width);
    //inner zoom
    //new ImageZoom("img", {/*options*/});
    
    //make so it only applies to product img
    // new ImageZoom("img", {  
    //     maxZoom: 5, 
    // });

}



function turnOffOtherBusts(keepOn) {
    for (var i = testArray.length - 1; i >= 0; i--) {
        if (i != keepOn) {
            testArray[i].visible = false;
        }     
    }
    allBustsOn = false;
}

function turnOnAllBusts() {
    for (var i = testArray.length - 1; i >= 0; i--) {
        testArray[i].visible = true;   
    }
    allBustsOn = true;
}

function updateRevolution() {
    var increment = 0.05; //changes speed
    var pathEllipse = 1.0;
    //theta is degrees
    if (revolveDirection == "left") {
        theta += increment;
    } else if (revolveDirection =="right"){
        theta -= increment;
    } else {
        console.log("error: undefined direction");
    }
    
    var radians = toRadians(theta);
    var radianPosition = 2*Math.PI/numModels;


    for (var i = testArray.length - 1; i >= 0; i--) {
        testArray[i].position.x = Math.cos(radians + i*radianPosition)+0.5;
        testArray[i].position.z = pathEllipse * Math.sin(radians + i*radianPosition)+0.5; 
        testArray[i].rotation.y = -1*(radians-(Math.PI/2)+ i*radianPosition);
    }

    // for (var i = testArray.length - 1; i >= 0; i--) {
    //     testArray[i].position.x = Math.cos(radians + i*radianPosition)+0.5;
    //     testArray[i].position.z = pathEllipse * Math.sin(radians + i*radianPosition)+0.5; 
    //     //testArray[i].rotation.y = -1*(radians-(Math.PI/2)+ i*radianPosition);
    // }
    //}
}

function findTargetTheta() {
    var evenInterval = (360/numModels);
    if (rotateAligned == false) {
        // console.log("align rotation once");
        var incrementTheta = (((Math.abs((theta-initialtheta)/evenInterval)) % 1)*evenInterval);
        // console.log("increment theta: " +incrementTheta);
        
        if (theta > 0 && revolveDirection == "left") {
            targetTheta = theta + evenInterval - incrementTheta;
        } else if (theta > 0 && revolveDirection == "right") {
            targetTheta = theta - incrementTheta;
        } else if (theta < 0 && revolveDirection == "left") {
            targetTheta = theta + evenInterval - incrementTheta;
        } else if (theta < 0 && revolveDirection == "right") {
            targetTheta = theta - incrementTheta;
        } 
        rotateAligned = true;
    } else {
        console.log("find next");
        if (theta > 0 && revolveDirection == "left") {
            targetTheta = theta + evenInterval;
        } else if (theta > 0 && revolveDirection == "right") {
            targetTheta = theta - evenInterval;
        } else if (theta < 0 && revolveDirection == "left") {
            targetTheta = theta + evenInterval;
        } else if (theta < 0 && revolveDirection == "right") {
            targetTheta = theta - evenInterval;
        }
    }

    // console.log("current theta: " + theta);
    // console.log("target theta: " + targetTheta);
}

function rotateOneBustInterval() {

    var increment = .6;
    var pathEllipse = 1;
    
    if (revolveDirection == "left") {
        theta += increment;
    } else if (revolveDirection =="right"){
        theta -= increment;
    } else {
        console.log("error: undefined direction");
    }
    

    var radians = toRadians(theta);
    var radianPosition = 2*Math.PI/numModels;

    for (var i = testArray.length - 1; i >= 0; i--) {
        testArray[i].position.x = Math.cos(radians + i*radianPosition)+0.5;
        testArray[i].position.z = pathEllipse * Math.sin(radians + i*radianPosition)+0.5; 
        testArray[i].rotation.y = -1*(radians-(Math.PI/2)+ i*radianPosition);
    }

    if (revolveDirection == "left" && (theta > targetTheta)) {
        // console.log("target reached, increasing theta");
        theta = targetTheta;
        pause = true;
        revolveClicked = false;
        
    } else if (revolveDirection == "right" && (theta < targetTheta)) {
        // console.log("target reached, decreasing theta");
        theta = targetTheta;
        pause = true;
        revolveClicked = false;

    }

}
//Geometry functions
function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}