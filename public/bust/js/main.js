
var isMobile;
var container;

//not triggered by layer change
var camera, controls, scene, raycaster, renderer;
var lighting, ambient, keyLight, fillLight, backLight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var numModels = 13;
var testArray = [];
var incrementBustMatch = [3,2,1,0,12,11,10,9,8,7,6,5,4];
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
var openLayerTwoDelay = false;

//check or change when layer changes
// var firstOpen;
var bustOn = undefined;
var allBustsOn = true;
var autoRotate = true;
var rotateAligned = false;
var elem;
var leftelem;
var baseelem;
var centerelem;

var storedTexture = [];
// var evt;
var m;

var currentURL;
//for rotating bust
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};

function init() {
    /* Events - Mobile and Desktop */
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById("title").onclick = function() {
        console.log("title clicked");
        goBackToLayerOne();
    };
    //2D | 3D options
    document.getElementById("twod").onclick = function() {display2DScan();};
    document.getElementById("threed").onclick = function() {display3DScan();};
    //arrow buttons
    document.getElementById("left").onclick = function() {
        //console.log("left arrow clicked");
        var currentItem = currentURL.substring(4,6);
        var newItem;
        if (currentItem != "01") {
            var numTemp = Number(currentItem) - 1;
            if (numTemp.toString().length == 1){
                numTemp = "0" + numTemp;
            }
            newItem = "AO-" + numTemp;  
        } else if (currentItem == "01") {
            newItem = "AO-13";
        }
        //console.log(newItem);
        openInfoPanel(newItem); 
        history.pushState("", "", "#" + newItem);
        currentURL = window.location.hash;
        
    };
    document.getElementById("right").onclick = function() {
        //console.log("right arrow clicked");
        var currentItem = currentURL.substring(4,6);
        var newItem;
        if (currentItem != "13") {
            var numTemp = Number(currentItem) + 1;
            if (numTemp.toString().length == 1){
                numTemp = "0" + numTemp;
            }
            newItem = "AO-" + numTemp;  
        } else if (currentItem == "13") {
            newItem = "AO-01";
        }
        //console.log(newItem);
        openInfoPanel(newItem); 
        history.pushState("", "", "#" + newItem);
        currentURL = window.location.hash;
        
    };

}

function initDesktop() {

    container = document.createElement('div');
    document.body.appendChild(container);

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }
    /* Camera */

    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 0.5;
    camera.position.y = 0.07;
    camera.position.z = 3.2;

    /* Scene */

    scene = new THREE.Scene();
    lighting = false;

    ambient = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambient);

    keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);
    // scene.add(keyLight);

    fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
    fillLight.position.set(100, 0, 100);
    // scene.add(fillLight);

    backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();
    // scene.add(backLight);

    sunLight = new THREE.SpotLight( 0xffffff, 0, 0, Math.PI/2 );
    sunLight.position.set( 1000, 2000, 1000 );
    sunLight.castShadow = false;
    scene.add( sunLight );

    spotlight = new THREE.SpotLight( 0x0000ff, 0.6, 156, 0.01, 0.7, 1.6 );
    spotlight.position.set(0.5,10,15);
    spotlight.target.position.set(0.5,0,1.5);
    spotlight.target.updateMatrixWorld();
    spotlight.castShadow = false;
    scene.add( spotlight );

    /* Generate 13 busts */
    var paths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"]
        .map(function(value) {
            return "assets/2014-AO-" + value + "/";
        });

    function loadNextPath() {
        var pathToLoad = paths.pop();
        // console.log(pathToLoad);
        if (!pathToLoad) {
            console.log("OK THERE SHOULD BE NO ANIMATES BEFORE THIS LINE!");
            animate();
            document.getElementById("loadingOverlay").style.display="none";
            if (currentURL != "") {
                //load specific piece
                var URLbust = 13 - currentURL.substring(4, 6);
                // console.log(currentURL.substring(1, 6));
                console.log("the current URL / model num is: " + URLbust);
                //now rotate busts to proper position
                //then change variable so bustOn will be opened
                var evenInterval = (360/numModels);
                targetTheta = theta + (evenInterval*incrementBustMatch[Number(URLbust)]);
                // console.log("URL: " + currentURL);
                // console.log("URLbust/bustOn: " + URLbust);
                // console.log("URLbust: " + incrementBustMatch[Number(URLbust)]);
                // console.log("targetTheta: " + targetTheta);
                rotateAligned = true;
                // rotate bust 
                revolveClicked = true;
                //open layer 2
                openLayerTwoDelay = true;
                if (isMobile == true) {
                    openInfoPanel(currentURL.substring(1, 6));
                    // writeItemDescription(currentURL.substring(1, 6));
                }
                //layer = "two";
            }
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
                    obj.name = pathToLoad.substring(12, 17);
                    // console.log(obj.name);
                    testArray.push(obj);
                    scene.add(obj);  
                    loadNextPath(); 
                });
            });
        }
    }
    loadNextPath();


    //URL
    currentURL = window.location.hash;

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

    console.log(isMobile);
    
    /* Events - Desktop Only */
    //for dragging/rotating bust
    document.getElementById("imgDisplay").onmousedown = function() {mouseDown()};
    document.getElementById("imgDisplay").onmousemove = function() {mouseMove(event)};
    document.getElementById("imgDisplay").onclick = function() {mouseDragOff()};
    document.getElementById("canvasID").onclick = function() {onCanvasClick(event)};
    document.getElementById("leftblock").onclick = function() {goBackToLayerOne();};
    document.getElementById("rightblock").onclick = function() {goBackToLayerOne();};
    document.onkeydown = checkKey;
  
    var infoPanel = document.getElementById('infoPanel');
    infoPanel.addEventListener ('click',  function (e) {
        console.log("clicked info panel");
        e.stopPropagation();
        // msg (elem);
    }, false);

    //info panel
    // document.getElementById("infoButton").onclick = function() {toggleInfoPanel();};
    var itemBox = document.getElementById('itemBox-bottom');
    itemBox.addEventListener ('click',  function (e) {
        e.stopPropagation();
        // msg (elem);
    }, false);

    //var buyButton = document.getElementById('product-component-21fa7a5ac51');
    // buyButton.addEventListener ('click',  function (e) {
    //     console.log("clicked buy button");
    //     e.stopPropagation();
    //     // msg (elem);
    // }, false);

    window.onpopstate=function() {
        // if (currentURL != "") {
            goBackToLayerOne();
        // }
        

    }


    // var centerline = document.getElementById("centerLine");
    // centerline.style.marginLeft = windowHalfX + "px";
    //magnifier
    var evt = new Event();
    m = new Magnifier(evt);

    

    //SHOPIFY BUTTONS
    //make a function so that the id is generated based on the item number
    // document.getElementById("buyButtonWrapper").firstChild.id = "product-component-21fa7a5ac51";

    //stats
    // javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.getElementById("stats").appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()   
}

function initMobile() {

    console.log("mobile detected");
    // var updateClass = document.getElementById("twoD-scan");
    // if(updateClass) {
    //     updateClass.className += updateClass.className ? 'mobile' : 'mobile';
    // }
    var updateClass = document.getElementById("mainbody");
    if(updateClass) {
        updateClass.className += updateClass.className ? ' mobile' : ' mobile';
    }
    //URL
    currentURL = window.location.hash;
    if (currentURL != "") {
        // console.log("load specific URL");
        openInfoPanel(currentURL.substring(1, 6));
        // writeItemDescription(currentURL.substring(1, 6));
    } else {
        // console.log("load first item");
        openInfoPanel("AO-01");
    }

}

window.onload = function() {
    console.log("start onload");
    console.log(window.outerWidth);
    if (window.outerWidth > 650) {
        isMobile = false;
        console.log("desktop detected");
        initDesktop();
        init(); 
        
    } else {
        document.getElementById("loadingOverlay").style.display="none";
        isMobile = true;
        console.log("mobile detected");
        initMobile();
        init();
    }
};

function checkURL() {
    console.log("check if URL changed");
}

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

    if (layer == "one" && (xClick > (0.33*window.innerWidth)) && (xClick < ((0.66*window.innerWidth))) && rotateAligned == true ){
        //console.log("go to layer 2");
        // if (rotateAligned == false) {
        //     //click is in center more to the left
        //     if (xClick < windowHalfX) {
        //         revolveDirection = "left";
        //     } else if (xClick > windowHalfX) {
        //         revolveDirection = "right";
        //     }
        //     console.log("rotate bust to the center");
        //     findTargetTheta();
        //     rotateOneBustInterval(); 
        // }
        layer = "two";
        // firstOpen = true; //so that this first click doesnt trigger layer 3

    } 
    if (layer == "one" && (xClick > (0.33*window.innerWidth)) && (xClick < ((0.66*window.innerWidth))) && rotateAligned == false ){
        //open layer two after bust is aligned
        openLayerTwoDelay = true;
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
    // console.log(testArray[bustOn].rotation.y);
              
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
    display3DScan();
    
    turnOnAllBusts();
    autoRotate = true;
    // revolveDirection = "left";
    layer = "one";
    pause = false;
    rotateAligned = false;
    sunLight.intensity = 0.0;
    spotlight.intensity = 0.6;
    history.pushState("", "", "index.html");
    currentURL = "";
    bustOn = undefined;
    // testArray[bustOn].rotation.y = -Math.PI/4; 
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
        // firstOpen = false;
        layerTwoUI();   
    }
    
    renderer.render(scene, camera);
}

/* Update Frame Functions */
function layerTwoUI() {
    if (allBustsOn == true) {
        //check if main page is loaded
        updateURL();
        isolateOneBust();
        openInfoPanel(testArray[bustOn].name);

        // m.attach({
        //     thumb: '#thumb',
        //     large: 'assets/2d-scan.png',
        //     largeWrapper: 'preview',
        //     mode: 'outside'
        // });

    } else {
        // console.log(testArray[bustOn].rotation.y);
        if (autoRotate == true) {
            testArray[bustOn].rotation.y -= 0.003;   
        }                
    }
}

function display2DScan() {
    
    if (isMobile == false) {
        testArray[bustOn].visible = false;   
    } else if (isMobile == true) {
        document.getElementById("threeD-gif").style.display = "none";  
    }
    document.getElementById("twoD-scan").style.display = "block";
    document.getElementById("twod").style.fontFamily = "Avenir-Heavy";
    document.getElementById("threed").style.fontFamily = "Avenir-Book";
}

function display3DScan() {
    if (isMobile == false) {
        testArray[bustOn].visible = true;
        document.getElementById("threeD-gif").style.display = "none";    
    } else if (isMobile == true) {
        document.getElementById("threeD-gif").style.display = "block";  
    }
    document.getElementById("twoD-scan").style.display = "none";
    document.getElementById("threed").style.fontFamily = "Avenir-Heavy";
    document.getElementById("twod").style.fontFamily = "Avenir-Book";
}

function updateURL() {
    if (bustOn == undefined) {
        bustOn = findClosestBust();   
    }
    // console.log(testArray[bustOn].name);
    history.pushState("", "", "#" + testArray[bustOn].name);
    currentURL = window.location.hash;
}

function isolateOneBust() {
    //define bustOn to be the center one based on max z position value
    pause = true;
    
    testArray[bustOn].position.x = 0.5;
    //testArray[bustOn].position.x = 0.5;
    turnOffOtherBusts(bustOn); 
    sunLight.intensity = 0.3;
    spotlight.intensity = 0.3;
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

function openInfoPanel(item) {
    console.log(item);
    writeItemDescription(item);
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

function writeItemDescription(item) {

    console.log("writeItemDescription: " + item);

    var result = AllItems.filter(function( obj ) {
        // console.log(obj.name);
        return obj.name === item;
    });
    //assign associated shopify button
    document.getElementById("buyButtonWrapper").firstChild.id = result[0].buttonID;
    // console.log(result[0].chain);
    document.getElementById('itemBox-top').style.display = "none";
    document.getElementById('itemBox-bottom').style.display = "block";
    document.getElementById('itemName-bottom').innerHTML = result[0].name;
    document.getElementById('itemPrice-bottom').innerHTML = result[0].price;
    document.getElementById('itemMaterial').innerHTML = "Material: " + result[0].material;
    document.getElementById('itemDimensions').innerHTML = "Dimensions: " + result[0].dimensions;
    document.getElementById('itemCast').innerHTML = "Casted by: " + result[0].casted;
    if (result[0].chain != undefined) {
        document.getElementById('itemChain').innerHTML = "Chain made by: " + result[0].chain;
    } else if (result[0].chain == undefined) {
        document.getElementById('itemChain').innerHTML = "";
    }
    document.getElementById('itemEdition').innerHTML = "Edition of " + result[0].edition;
    document.getElementById('twoD-scan').src = "/public/bust/assets/2D-scans/" + result[0].name + ".jpg";
    if (isMobile == true) {
        document.getElementById('itemBox-top').style.display = "block";
        document.getElementById('itemBox-bottom').style.display = "none";
        document.getElementById('itemName-top').innerHTML = result[0].name;
        document.getElementById('itemPrice-top').innerHTML = result[0].price;
        document.getElementById('threeD-gif').src = "/public/bust/assets/3D-gifs/" + result[0].name + "/threed.gif";
    }
    

    
    ShopifyBuyInit(item);
}


function turnOffOtherBusts(keepOn) {
    
    for (var i = testArray.length - 1; i >= 0; i--) {
        if (i != keepOn) {
            storedTexture[i] = testArray[i].children[0].material.map;
            // testArray[i].visible = false;
            testArray[i].children[0].material.transparent = true;
            // testArray[i].children[0].material.opacity = "0.5";
            // testArray[i].children[0].material.wireframe = true;
            testArray[i].children[0].material.color.setHex( 0xD3D3D3 );
            testArray[i].children[0].material.map = null;
            testArray[i].children[0].material.needsUpdate = true;
        }     
    }
    //put transparent div in front of busts
    // document.getElementById("loadingOverlay").style.display="block";

    allBustsOn = false;
}

function turnOnAllBusts() {
    for (var i = testArray.length - 1; i >= 0; i--) {
        if (i != bustOn) {
            testArray[i].visible = true; 
            // testArray[i].children[0].material.wireframe = false;
            testArray[i].children[0].material.map = storedTexture[i];
            testArray[i].children[0].material.needsUpdate = true;
            // testArray[i].children[0].material.transparent = true;
            // testArray[i].children[0].material.opacity = "1.0";
        }
              
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
    if (bustOn != undefined) {
        // console.log("see when pos changes after closing: " + radians);
    }

    for (var i = testArray.length - 1; i >= 0; i--) {
        testArray[i].position.x = Math.cos(radians + i*radianPosition)+0.5;
        testArray[i].position.z = pathEllipse * Math.sin(radians + i*radianPosition)+0.5; 
        testArray[i].rotation.y = -1*(radians-(Math.PI/2)+ i*radianPosition);
        // console.log(testArray[i].rotation.y);
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
         
        // console.log("increment theta: " + incrementTheta);
        // console.log("theta: " + theta);
        
        if (theta > 0 && revolveDirection == "left") {
            targetTheta = theta + evenInterval - incrementTheta;
        } else if (theta > 0 && revolveDirection == "right") {
            targetTheta = theta - incrementTheta;
        } else if (theta < 0 && revolveDirection == "left") {
            targetTheta = theta + incrementTheta;
        } else if (theta < 0 && revolveDirection == "right") {
            targetTheta = theta - (evenInterval - incrementTheta);
        } 
        rotateAligned = true;
    } else {
        // console.log("find next");
        // console.log("theta: " +theta);
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
        if (openLayerTwoDelay == true) {
            layer = "two";
            // firstOpen = true;
            openLayerTwoDelay = false;
        }
        
    } else if (revolveDirection == "right" && (theta < targetTheta)) {
        // console.log("target reached, decreasing theta");
        theta = targetTheta;
        pause = true;
        revolveClicked = false;
        if (openLayerTwoDelay == true) {
           layer = "two";
            // firstOpen = true; 
            openLayerTwoDelay = false;
        }

    }

}
//Geometry functions
function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

// MOBILE FUNCTIONS
















