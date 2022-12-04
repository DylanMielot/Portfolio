export class animationManager{
    static isRunning = []
    static animateOnScreen = []
    static animateOnLoad = []
    static animateOnMouseOver = []
    static progressBar = document.querySelector("#globalProgressBar")

    static startManaging(){
        // Run onLoad animations
        this.animateOnLoad.forEach((anim)=>{
            this.runAnimation(anim)
        })
        
        // listen onScreen animations
        document.addEventListener('scroll', ()=>{
            this.animateOnScreen.forEach((anim)=>{
                if(anim[1].getBoundingClientRect().top <= window.innerHeight/2 && 
                anim[1].getBoundingClientRect().bottom >= window.innerHeight/2){
                    this.runAnimation(anim[0])
                } else {
                    this.pauseAnimation(anim[0])
                }
            })
        })

        // listen onMouseOver animations
        this.animateOnMouseOver.forEach((anim)=>{
            anim[1].addEventListener('mouseover', ()=>{
                this.runAnimation(anim[0])
            })
            anim[1].addEventListener('mouseleave', ()=>{
                this.pauseAnimation(anim[0])
            })
        })
    }

    static manage(animation, callbacks, container=null){
        if(this.checkAnimationPrototype(animation)){
            callbacks.forEach((callback)=>{
                callback(animation, container)
            })
        }
    }

    static onScreen(animation, container){
        if(container != null){
            animationManager.animateOnScreen.push([animation, container])
        } else { 
            console.error("onScreen event works with a container as parameter")
        }
    }
    static onLoad(animation){
        animationManager.animateOnLoad.push(animation)
    }
    static onMouseOver(animation, container){
        if(container != null){
            animationManager.animateOnMouseOver.push([animation, container])
        } else { 
            console.error("onMouseOver event works with a container as parameter")
        }
    }
    
    static addRunningAnimation(animation){
        if(this.isRunning.indexOf(animation) == -1){
            this.isRunning.push(animation)
        }
    }
    static removeRunningAnimation(animation){
        this.isRunning.splice(this.isRunning.indexOf(animation),1)
    }

    static runAnimation(animation){
        if(document.fullscreenElement == null){
            if(!animation.isAnimated){
                animation.isAnimated = true
                animation.resume()
                this.addRunningAnimation(animation)
            
                if(animation.alsoAnimate.length != 0){
                    animation.alsoAnimate.forEach((anim)=>{
                        this.runAnimation(anim)
                    })
                }
                if(animation.reverseAnimate.length != 0){
                    animation.reverseAnimate.forEach((anim)=>{
                        this.pauseAnimation(anim)
                    })
                }
            }
        }
    }
    static pauseAnimation(animation){
        if(animation.isAnimated){
            animation.isAnimated = false
            animation.pause()
            this.removeRunningAnimation(animation)

            if(animation.alsoAnimate.length != 0){
                animation.alsoAnimate.forEach((anim)=>{
                    this.pauseAnimation(anim)
                })
            }
            if(animation.reverseAnimate.length != 0){
                animation.reverseAnimate.forEach((anim)=>{
                    this.runAnimation(anim)
                })
            }
        }
    }

    static checkAnimationPrototype(animation){
        if(Object.getPrototypeOf(animation.constructor).name == "Animation"){
            return true
        } else {
            console.error("Animation must inherite from Animation prototype")
            return false
        }
    }
}

// Based class for animations
export class Animation{
    animation = null
    isAnimated = false
    reverseAnimate = []
    alsoAnimate = []

    resume(){
        // To overwrite
        console.error('resume method to overwrite')
    }
    pause(){
        // To overwrite
        console.error('pause method to overwrite')
    }

    dontAnimateWhenIsAnimated(animations){
        animations.forEach((animation)=>{
            if(animationManager.checkAnimationPrototype(animation)){
                if(this.checkAnimationsDependencies(animation)){
                    this.reverseAnimate.push(animation)
                }
            }
        })
    }
    animateWhenIsAnimated(animations){
        animations.forEach((animation)=>{
            if(animationManager.checkAnimationPrototype(animation)){
                if(this.checkAnimationsDependencies(animation)){
                    this.alsoAnimate.push(animation)
                }
            }
        })
    }

    checkAnimationsDependencies(animation){
        if(animation.reverseAnimate.indexOf(this) == -1 && animation.alsoAnimate.indexOf(this) == -1
        && this.reverseAnimate.indexOf(animation) == -1 && this.alsoAnimate.indexOf(animation) == -1){
            return true
        } else {
            console.error("Error when adding " + this.constructor.name + " dependency for " + animation.constructor.name + " : these animations are already dependent on each other")
        }
    }
}

export class CSSAnimation extends Animation{
    timeout = null

    constructor(block){
        super()
        this.container = block
    }
    resume(){
        Array.from(this.container).forEach((block)=>{
            block.style.animationPlayState = "running"
            if(this.timeout != null){
                setTimeout(()=>{
                    animationManager.pauseAnimation(this)
                }, this.timeout)
            }
        })
    }
    pause(){
        Array.from(this.container).forEach((block)=>{
            block.style.animationPlayState = "paused"
        })
    }

    pauseAfterTimeout(timeout){
        if(typeof(timeout) == 'number'){
            this.timeout = timeout
        } else {
            console.error("timeout must be of type number")
        }
    }
}

export class imageParticleAnimation extends Animation{
    canvas = null
    image = new Image()
    ctx = null
    mouse = null
    pixels = null
    numberOfParticles = null
    mappedImage = []
    particlesArray = []

    constructor(canvas, imageSRC){
        super()
        this.canvas = canvas
        this.image.src= imageSRC
        this.ctx = this.canvas.getContext("2d", {willReadFrequently: true})
        this.image.addEventListener('load', ()=>{
            this.init()
            this.addEventListener()
        })        
    }

    init(){
        this.canvas.width = this.canvas.parentElement.offsetWidth
        this.canvas.height = this.canvas.parentElement.offsetHeight

        this.mouse = {
            x : null,
            y : null,
            radius : 80 * (window.innerWidth/1366)
        }

        this.getImagePixels()
        this.setNumberOfParticles()
        this.getMappedImage()

        this.particlesArray = []
        for(let j =0; j < this.numberOfParticles; j++){
            this.particlesArray.push(new coverParticles(this))
        }
    }

    tick(){
        this.ctx.globalAlpha = 0.25
        this.ctx.fillStyle = 'rgb(0, 0, 0)'
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
        for(let n = 0; n < this.particlesArray.length; n++){
            this.particlesArray[n].update()
            this.ctx.globalAlpha = this.particlesArray[n].speed * 0.2
            this.particlesArray[n].draw()

        }
        if(this.isAnimated){
            this.animation = requestAnimationFrame(this.tick.bind(this))
        }
    }

    pause(){
        window.cancelAnimationFrame(this.animation)
    }

    resume(){
        this.tick()
    }

    addEventListener(){
        this.canvas.addEventListener("mousemove", (event)=>{
            var rect = event.target.getBoundingClientRect()
            this.mouse.x = event.x - rect.left
            this.mouse.y = event.y - rect.top
        })
        window.addEventListener("resize", ()=>{
            this.init()
        })
        this.canvas.addEventListener("mouseleave", ()=>{
            this.mouse.x = undefined
            this.mouse.y = undefined
        })
    }

    getImagePixels(){
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)
        this.pixels = this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height)
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
    }

    setNumberOfParticles(){
        let numberOfParticles1 = 2500 * (window.innerWidth/1366)//window.innerWidth * 3
        if(numberOfParticles1 > 5000){
            numberOfParticles1 = 5000
        } else if(numberOfParticles1 < 2000){
            numberOfParticles1 = 2000
        }
        this.numberOfParticles = numberOfParticles1
    }

    getMappedImage(){
        let mappedImage1 = []
        let cellBrightness = null
        for(let y=0; y < this.canvas.height; y++){
            let row = []
            for(let x = 0; x < this.canvas.width; x++){
                const red = this.pixels.data[(y * 4 * this.pixels.width) + (x * 4)]
                const green = this.pixels.data[(y * 4 * this.pixels.width) + (x * 4 + 1)]
                const blue = this.pixels.data[(y * 4 * this.pixels.width) + (x * 4 + 2)]
                const brightness = this.calculateRelativeBrightness(red, green, blue)
                const cell = [
                    cellBrightness = brightness
                ]
                row.push(cell)
            }
            mappedImage1.push(row)
        }
        this.mappedImage = mappedImage1
    }

    calculateRelativeBrightness(red, green, blue){
        return Math.sqrt(
            red**2 * 0.299 +
            green**2 * 0.587 + 
            blue**2 * 0.114
        )/100
    }
}


class coverParticles{
    constructor(animation){
        this.x = Math.random() * animation.canvas.width
        // Optimization by calculating y according to x (curve)
        this.y = Math.sqrt((Math.sin(((animation.canvas.width/2 - this.x)/(animation.canvas.width/2.3))**2)*animation.canvas.height)**2)
        this.baseX = this.x
        this.speed = 0
        this.velocity = Math.random() * 1.5
        this.size = Math.random() * (2 * (window.innerWidth/1366)) + 1
        this.position1 = Math.floor(this.y)
        this.position2 = Math.floor(this.x)
        this.animation = animation
        if(this.size < 1.5){
            this.size = Math.random()*1.5 + 1
        }
    }

    update(){
        this.position1 = Math.floor(this.y)
        this.position2 = Math.floor(this.x)
        this.speed = this.animation.mappedImage[this.position1][this.position2][0]
        let movement = (3.5 - this.speed*1.2)*(this.animation.canvas.height/720) + this.velocity

        this.y += movement
        if(this.y >= this.animation.canvas.height){
            this.x = Math.random() * this.animation.canvas.width
            this.y = Math.sqrt((Math.sin(((this.animation.canvas.width/2 - this.x)/(this.animation.canvas.width/2.3))**2)*this.animation.canvas.height)**2)
            this.baseX = this.x
        }

        let dx = this.animation.mouse.x - this.x
        let dy = this.animation.mouse.y - this.y
        let distance = Math.sqrt(dx**2 + dy**2)

        if(distance < this.animation.mouse.radius){
            
            this.x -= Math.cos(Math.atan2(dy, dx*100))*3

            if(this.x < 0){
                this.x = 1
            } else if(this.x > this.animation.canvas.width){
                this.x = this.animation.canvas.width - 1
            }
            

        } else {
            if(this.x != this.baseX){
                let dx = this.x - this.baseX
                this.x -= dx/15
            }
        }
    }

    draw(){
        this.animation.ctx.beginPath()
        this.animation.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        this.animation.ctx.fillStyle = 'white'
        this.animation.ctx.fill()
    }
}

