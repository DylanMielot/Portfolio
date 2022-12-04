import * as THREE from 'three'

let particleTexture = require("../images/circle.png")

const textureLoader = new THREE.TextureLoader()
const dustTexture = textureLoader.load(particleTexture)

export class Marker{
    constructor(width = 30, depth = 30, separator = 1, pointSize = 0.5, center = true){
        this.center = center
        this.pointsBufferGeometry
        this.pointsMaterial
        this.pointsMesh
        this.width = width
        this.depth = depth
        this.separator = separator
        this.pointSize = pointSize
        this.axisRadius = 0.2
        this.xAxis
        this.yAxis
        this.zAxis

        this.brutEquation
        this.equation
        this.setEquation("cos((x**2 + z**2)/1000 - time*1.5) * 10")//("tan((10x^2 + z^4) * 0.00009 - time/20) * 5")
        this.newYPosition = Function("x = 0", "z = 0", "time = 0", "return " + this.equation)

        this.createBufferGeometry()
        this.createMaterial()
        this.createMesh()
        this.createPoints()
        this.createMarker()
    }
    
    createBufferGeometry(){
        this.pointsBufferGeometry = new THREE.BufferGeometry()
    }

    getBufferGeometry(){
        return this.pointsBufferGeometry
    }

    createMaterial(){
        this.pointsMaterial = new THREE.PointsMaterial({
            size: this.pointSize,
            color : 0x00AAFF,
            map:dustTexture,
            alphaTest:0.1
        })
    }

    createMesh(){
        this.pointsMesh = new THREE.Points(this.pointsBufferGeometry, this.pointsMaterial)
    }

    createPoints(){
        let position = []
        let width = this.width
        let depth = this.depth
        let separator = this.separator
        let vertexShader = this.getBufferGeometry()
        if(this.center){
            var xMovement = Math.floor(this.width/2)
            var zMovement = Math.floor(this.depth/2)
        } else {
            var xMovement = 0
            var zMovement = 0
        }

        for(let i = 0; i < width; i++){
            for(let w = 0; w < depth; w++){
                let x = separator * (i - xMovement)
                let z = separator * (w - zMovement)
                let y = this.newYPosition(x, z)
                
                position.push(x, y, z)
            }
        }
    
    
        vertexShader.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position), 3))
    }

    update(time){
        const dustVerticesPos = this.pointsBufferGeometry.attributes.position.array
        for(let i = 1; i < dustVerticesPos.length; i += 3){
            let x = dustVerticesPos[i - 1]
            let z = dustVerticesPos[i + 1]
            try{
                dustVerticesPos[i] = this.newYPosition(x, z, time)
            } catch(e) {
                this.setError(e)
            }
        }
        this.getBufferGeometry().attributes.position.needsUpdate = true
    }

    getEquation(){
        return this.brutEquation
    }

    setEquation(equation){
        try{
            this.brutEquation = equation
            this.equation = equation
            .replaceAll(/\basin/g, "Math.asin")
            .replaceAll(/\batan/g, "Math.atan")
            .replaceAll(/\bacos/g, "Math.acos")
            .replaceAll(/\bcos/g, "Math.cos")
            .replaceAll(/\bsin/g, "Math.sin")
            .replaceAll(/\btan/g, "Math.tan")
            .replaceAll("²", "**2")
            .replaceAll("X", "x")
            .replaceAll("Z", "z")
            .replaceAll("^", "**")
            .replaceAll(/(\d+)(x)/g, '$1*$2')
            .replaceAll(/(\d+)(z)/g, '$1*$2')
            .replaceAll("PI", "Math.PI")
            .replaceAll("pi", "Math.PI")
            .replaceAll("abs", "Math.abs")
            .replaceAll("sqrt", "Math.sqrt")
            .replaceAll("random", "Math.random()")
            
            this.newYPosition = Function("x = 0", "z = 0", "time = 0", "return " + this.equation)
        } catch(e){
            this.setError(e)
        }
    }

    updateMarker(){
        this.xAxis.geometry.dispose()
        this.yAxis.geometry.dispose()
        this.zAxis.geometry.dispose()

        var xAxisGeometry = new THREE.CylinderGeometry( this.axisRadius, this.axisRadius, this.width*this.separator, 10 ); // number of particles * space
        var yAxisGeometry = new THREE.CylinderGeometry( this.axisRadius, this.axisRadius, this.width*this.separator, 10 ); // height zAxis * space
        var zAxisGeometry = new THREE.CylinderGeometry( this.axisRadius, this.axisRadius, this.depth*this.separator, 10 ); // number/ widthParticlesMesh * space

        this.xAxis.geometry = xAxisGeometry
        this.yAxis.geometry = yAxisGeometry
        this.zAxis.geometry = zAxisGeometry

        if(!this.center){
            this.xAxis.position.x = this.width/2 * this.separator
        } else {
            this.xAxis.position.x = 0
        }

        if(!this.center){
            this.zAxis.position.z = this.depth/2 * this.separator
        } else {
            this.zAxis.position.z = 0
        }

    }

    updateAxisRadius(value){
        this.axisRadius = value
        this.updateMarker()
    }

    createMarker(){
        const xAxisGeometry = new THREE.CylinderGeometry( this.axisRadius, this.axisRadius, this.width*this.separator, 10 ); // number of particles * space
        const yAxisGeometry = new THREE.CylinderGeometry( this.axisRadius, this.axisRadius, this.width*this.separator, 10 ); // height zAxis * space
        const zAxisGeometry = new THREE.CylinderGeometry( this.axisRadius, this.axisRadius, this.depth*this.separator, 10 ); // number/ widthParticlesMesh * space
        
        const xMaterial = new THREE.MeshBasicMaterial( {
            color: 0xff0000
        });
        const yMaterial = new THREE.MeshBasicMaterial( {
            color: 0xffff00
        });
        const zMaterial = new THREE.MeshBasicMaterial( {
            color: 0x00ff00
        });


        const xAxis = new THREE.Mesh( xAxisGeometry, xMaterial );
        const yAxis = new THREE.Mesh( yAxisGeometry, yMaterial );
        const zAxis = new THREE.Mesh( zAxisGeometry, zMaterial );

        xAxis.rotation.z = 90 * Math.PI/180
        if(!this.center){
            xAxis.position.x = this.width/2 * this.separator
        }

        if(!this.center){
            zAxis.position.z = this.depth/2 * this.separator
        }
        zAxis.rotation.x = 90 * Math.PI/180

        this.xAxis = xAxis
        this.yAxis = yAxis
        this.zAxis = zAxis
        
    }

    setColor(color){
        try{
            this.pointsMaterial.color = new THREE.Color(color)
        }catch(e){
            this.setError(e)
        }
    }

    setSize(size, type){
        size = parseInt(size)
        if(size > 0){
            if(type=="width"){
                if(size % 2 == 0){
                    size += 1
                    console.log("INFO : width must be an odd number for a better accuracy")
                }
                this.width = size

            } else if(type=="depth"){
                if(size % 2 == 0){
                    size += 1
                    console.log("INFO : depth must be an odd number for a better accuracy")
                }
                this.depth = size

            } else {
                this.setError("Error, please retry")
            }

            this.createPoints()
        } else {
            this.setError("Width and depth must be positive numbers")
        }
    }

    setError(error){
        document.querySelector("#error").textContent = error
    }

    addScene(scene){
        scene.add(this.pointsMesh)
        scene.add(this.xAxis, this.yAxis, this.zAxis)
    }
}