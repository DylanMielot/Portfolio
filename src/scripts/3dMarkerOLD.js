import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Marker } from './orthonormalMarker.js'


// Canvas
const canvas = document.querySelector('#canvas2')

// Scene
const scene = new THREE.Scene()


///////////////////////////////////////////////////////
// Mesh
///////////////////////////////////////////////////////

const marker = new Marker(301,151,0.5,0.3)
marker.addScene(scene)


///////////////////////////////////////////////////////
// Lights
///////////////////////////////////////////////////////
var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 300, 0 );
scene.add( hemiLight );


///////////////////////////////////////////////////////
// Sizes
///////////////////////////////////////////////////////
const sizes = {
    width: canvas.parentElement.offsetWidth,
    height: canvas.parentElement.offsetHeight
}

window.addEventListener('resize', () =>
{
    window.cancelAnimationFrame(animation)
    canvas.style.height = "100%"
    canvas.style.width = "100%"
    // Update sizes
    sizes.width = canvas.parentElement.offsetWidth
    sizes.height = canvas.parentElement.offsetHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    effectComposer.setSize(sizes.width, sizes.height)
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    tick()
})

///////////////////////////////////////////////////////
//Camera
///////////////////////////////////////////////////////
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 700)
camera.position.z = 50
camera.position.y = 10
camera.position.x = 50
scene.add(camera)


///////////////////////////////////////////////////////
// Controls
///////////////////////////////////////////////////////
const controls = new OrbitControls(camera, canvas)


///////////////////////////////////////////////////////
// Renderer
///////////////////////////////////////////////////////
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


///////////////////////////////////////////////////////
// Post processing
///////////////////////////////////////////////////////
const renderScene = new RenderPass(scene, camera)
const effectComposer = new EffectComposer(renderer)
effectComposer.addPass(renderScene)

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.7,
    0.7,
    0.1
)
effectComposer.addPass(bloomPass)


///////////////////////////////////////////////////////
// Animate
///////////////////////////////////////////////////////

function onDocumentKeyDown(event){
    var keyCode = event.which
    if (event.ctrlKey && keyCode == 32){
        if(!pause){
            pause = true
        } else {
            pause = false
        }
    }
}


const clock = new THREE.Clock()


///////////////////////////////////////////////////////
// Functions 
///////////////////////////////////////////////////////


///////////////////////////////////////////////////////
// render
///////////////////////////////////////////////////////
let isAnimated2 = false
let animation
let pause = false
let time = 0
const tick = () =>
{

    if(!pause){
        
        timeInfo.textContent = "time = " + time.toFixed(2)
        
        //const elapsedTime = clock.getElapsedTime()
        time += 0.03

        if(document.querySelector("#error").textContent == ""){
            marker.update(time)
        }
    }


    // Update Orbital Controls
    controls.update()

    // Render
    //renderer.render(scene, camera)
    effectComposer.render()

    if(isAnimated2){
        // Call tick again on the next frame
        animation = window.requestAnimationFrame(tick)
    }
}

canvas.addEventListener("mouseleave", ()=>{
    if(isAnimated2){
        isAnimated2 = false
    }
    window.cancelAnimationFrame(animation)
    runBackgroundAnimations()
})
canvas.addEventListener("mouseover", ()=>{
    if(!isAnimated2){
        isAnimated2 = true
        tick()
    }
    stopBackgroundAnimations()
})

/*window.addEventListener( 'pointermove', onPointerMove );

var colorPicker = document.querySelector("#colorPicker")
var markerWidth = document.querySelector("#widthSize")
var markerDepth = document.querySelector("#depthSize")*/
var inputEquation = document.querySelector("#equation")
var equationBloc = document.querySelector("#equationBloc")
var timeInfo = document.querySelector("#timeInfo")
var errorBloc = document.querySelector("#error")
/*var centeredButton = document.querySelector("#centered")
var positiveOnlyButton = document.querySelector("#positiveOnly")
var axisRadiusDOM = document.querySelector("#axisRadius")*/

inputEquation.value = marker.getEquation()
/*markerWidth.value = marker.width
markerDepth.value = marker.depth
axisRadiusDOM.value = marker.axisRadius

axisRadiusDOM.addEventListener("change", ()=>{
    marker.updateAxisRadius(axisRadiusDOM.value)
})*/

equationBloc.addEventListener("mouseenter", ()=>{
    window.cancelAnimationFrame(animation)
    if(!isAnimated2){
        isAnimated2 = true
        tick()
    }
    stopBackgroundAnimations()
})

inputEquation.addEventListener("change", ()=>{
    errorBloc.textContent = ""
    marker.setEquation(inputEquation.value)
})

/*colorPicker.addEventListener("change", ()=>{
    marker.setColor(colorPicker.value)
})

markerWidth.addEventListener("change", ()=>{
    errorBloc.textContent = ""
    marker.setSize(markerWidth.value, "width")
    marker.updateMarker()
})

markerDepth.addEventListener("change", ()=>{
    errorBloc.textContent = ""
    marker.setSize(markerDepth.value, "depth")
    marker.updateMarker()
})

centeredButton.addEventListener("click", ()=>{
    centeredButton.classList.add("selected")
    centeredButton.classList.remove("notselected")
    positiveOnlyButton.classList.remove("selected")
    positiveOnlyButton.classList.add("notselected")
    if(marker.center != true){
        marker.center = true
        marker.createPoints()
        marker.updateMarker()
    }
})

positiveOnlyButton.addEventListener("click", ()=>{
    positiveOnlyButton.classList.add("selected")
    positiveOnlyButton.classList.remove("notselected")
    centeredButton.classList.remove("selected")
    centeredButton.classList.add("notselected")
    if(marker.center != false){
        marker.center = false
        marker.createPoints()
        marker.updateMarker()
    }
})*/

window.addEventListener("keydown", onDocumentKeyDown, false);

setTimeout(tick, 1000)