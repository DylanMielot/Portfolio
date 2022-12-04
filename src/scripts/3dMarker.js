import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Marker } from './orthonormalMarker.js'
import {Animation} from './animationManager.js'

export class Marker3DAnimation extends Animation{
    canvas = null
    scene = null
    marker = null
    hemiLight = null
    sizes = null
    camera = null
    controls = null
    renderer = null
    renderScene = null
    effectComposer = null
    pauseUpdate = false
    timeInfo = document.querySelector("#timeInfo") // To change
    inputEquation = document.querySelector("#equation") // To change
    errorBloc = document.querySelector("#error") // To change
    resetTime = document.querySelector("#resetTime") // To change
    time = 0

    constructor(canvas){
        super()
        this.canvas = canvas
        this.scene = new THREE.Scene()
        this.marker = new Marker(301,151,0.5,0.3)
        this.marker.addScene(this.scene)

        this.sizes = {
            width: this.canvas.parentElement.offsetWidth,
            height: this.canvas.parentElement.offsetHeight
        }

        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 )
        this.hemiLight.position.set( 0, 300, 0 )
        this.scene.add( this.hemiLight )

        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 700)
        this.camera.position.z = 50
        this.camera.position.y = 10
        this.camera.position.x = 50
        this.scene.add(this.camera)

        this.controls = new OrbitControls(this.camera, this.canvas)

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        })

        let renderScene = new RenderPass(this.scene, this.camera)
        this.effectComposer = new EffectComposer(this.renderer)
        this.effectComposer.addPass(renderScene)

        let bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            0.7,
            0.7,
            0.1
        )
        this.effectComposer.addPass(bloomPass)

        this.inputEquation.value = this.marker.getEquation()

        this.init()
        this.addEventListener()
    }

    init(isResized=false){
        
        this.canvas.style.height = "100%"
        this.canvas.style.width = "100%"

        this.sizes = {
            width: this.canvas.parentElement.offsetWidth,
            height: this.canvas.parentElement.offsetHeight
        }

        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        this.effectComposer.setSize(this.sizes.width, this.sizes.height)
        this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        if(!isResized){
            this.tick()
        }
    }
    
    tick(){
        if(!this.pauseUpdate){
        
            this.timeInfo.textContent = "time = " + this.time.toFixed(2)
            this.time += 0.03
    
            if(this.errorBloc.textContent == ""){
                this.marker.update(this.time)
            }
        }
    
        this.controls.update()

        this.effectComposer.render()
    
        if(this.isAnimated){
            this.animation = window.requestAnimationFrame(this.tick.bind(this))
        }
    }

    resume(){
        this.tick()
    }

    pause(){
        window.cancelAnimationFrame(this.animation)
    }

    addEventListener(){
        window.addEventListener('resize', () =>{
            this.init(true)
        })
        this.inputEquation.addEventListener("change", ()=>{
            this.errorBloc.textContent = ""
            this.marker.setEquation(this.inputEquation.value)
        })
        window.addEventListener("keydown", this.onDocumentKeyDown.bind(this), false);

        this.resetTime.addEventListener('click', ()=>{
            this.time = 0
        })
    }

    onDocumentKeyDown(event){
        let keyCode = event.which
        if (event.ctrlKey && keyCode == 32){
            if(!this.pauseUpdate){
                this.pauseUpdate = true
            } else {
                this.pauseUpdate = false
            }
        }
    }
}