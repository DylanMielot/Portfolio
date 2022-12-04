const image = new Image()

image.src = require("../images/me.jpg")

image.addEventListener('load', ()=>{
    
    const canvas = document.querySelector("#canvas1")
    const ctx = canvas.getContext("2d", {willReadFrequently: true})
    canvas.width = canvas.parentElement.offsetWidth
    canvas.height = canvas.parentElement.offsetHeight
    
    function getImagePixels(){
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        var pixels1 = ctx.getImageData(0,0, canvas.width, canvas.height)
        ctx.clearRect(0,0, canvas.width, canvas.height)

        return pixels1
    }

    let pixels1 = getImagePixels()



    function setNumberOfParticles(){
        let numberOfParticles1 = 2500 * (window.innerWidth/1366)//window.innerWidth * 3
        if(numberOfParticles1 > 5000){
            numberOfParticles1 = 5000
        } else if(numberOfParticles1 < 2000){
            numberOfParticles1 = 2000
        }
        return numberOfParticles1
    }
    let numberOfParticles1 = setNumberOfParticles() //2.5 //3000 // <== change to adapte to the screen size

    function getMappedImage(){
        let mappedImage1 = []
        for(let y=0; y < canvas.height; y++){
            let row = []
            for(let x = 0; x < canvas.width; x++){
                const red = pixels1.data[(y * 4 * pixels1.width) + (x * 4)]
                const green = pixels1.data[(y * 4 * pixels1.width) + (x * 4 + 1)]
                const blue = pixels1.data[(y * 4 * pixels1.width) + (x * 4 + 2)]
                const brightness = calculateRelativeBrightness(red, green, blue)
                const cell = [
                    cellBrightness = brightness
                ]
                row.push(cell)
            }
            mappedImage1.push(row)
        }
        return mappedImage1
    }

    let mappedImage1 = getMappedImage()

    function calculateRelativeBrightness(red, green, blue){
        return Math.sqrt(
            red**2 * 0.299 +
            green**2 * 0.587 + 
            blue**2 * 0.114
        )/100
    }

    var mouse = {
        x : null,
        y : null,
        radius : 80 * (window.innerWidth/1366)
    }

    canvas.addEventListener("mousemove", (event)=>{
        var rect = event.target.getBoundingClientRect()
        mouse.x = event.x - rect.left
        mouse.y = event.y - rect.top
    })

    class Particles1{
        constructor(){
            this.x = Math.random() * canvas.width
            // Optimization by calculating y according to x (curve)
            this.y = this.y = Math.sqrt((Math.sin(((canvas.width/2 - this.x)/(canvas.width/2.3))**2)*canvas.height)**2)
            this.baseX = this.x
            this.speed = 0
            this.velocity = Math.random() * 1.5
            this.size = Math.random() * (2 * (window.innerWidth/1366)) + 1
            this.position1 = Math.floor(this.y)
            this.position2 = Math.floor(this.x)

            if(this.size < 1.5){
                this.size = Math.random()*1.5 + 1
            }
        }

        update(){
            this.position1 = Math.floor(this.y)
            this.position2 = Math.floor(this.x)
            this.speed = mappedImage1[this.position1][this.position2][0]
            let movement = (3.5 - this.speed)*(canvas.height/720) + this.velocity

            this.y += movement
            if(this.y >= canvas.height){
                this.x = Math.random() * canvas.width
                this.y = Math.sqrt((Math.sin(((canvas.width/2 - this.x)/(canvas.width/2.3))**2)*canvas.height)**2)
                this.baseX = this.x
            }

            let dx = mouse.x - this.x
            let dy = mouse.y - this.y
            let distance = Math.sqrt(dx**2 + dy**2)

            if(distance < mouse.radius){
                
                this.x -= (mouse.radius/distance) * Math.cos(Math.atan2(dy, dx*100))*2

                if(this.x < 0){
                    this.x = 1
                } else if(this.x > canvas.width){
                    this.x = canvas.width - 1
                }
                

            } else {
                if(this.x != this.baseX){
                    let dx = this.x - this.baseX
                    this.x -= dx/15
                }
            }
        }

        draw(){
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
            ctx.fillStyle = 'white'
            ctx.fill()
        }
    }

    
    let particlesArray1 = []
    function init1(){
        for(let j =0; j < numberOfParticles1; j++){
            particlesArray1.push(new Particles1)
        }
    }

    init1()

    var animation1
    let mustAnimate = false
    function animate1(){
        ctx.globalAlpha = 0.25
        ctx.fillStyle = 'rgb(0, 0, 0)'
        ctx.fillRect(0,0, canvas.width, canvas.height)
        for(let n = 0; n < particlesArray1.length; n++){
            particlesArray1[n].update()
            ctx.globalAlpha = particlesArray1[n].speed * 0.2
            particlesArray1[n].draw()

        }
        if(mustAnimate){
            animation1 = requestAnimationFrame(animate1)
        }
    }

    animate1()

    //var Welcomecontainer = document.querySelector("#Welcomecontainer")
    Welcomecontainer.addEventListener("mouseleave", ()=>{
        mustAnimate = false
        window.cancelAnimationFrame(animation1)
        runBackgroundAnimations()
    })
    
    Welcomecontainer.addEventListener("mouseover", ()=>{
        if(!mustAnimate){
            mustAnimate = true
            animate1()
        }
        stopBackgroundAnimations()
    })
    
    canvas.addEventListener("mouseleave", ()=>{
        mouse.x = undefined
        mouse.y = undefined
    })

    window.addEventListener("resize", ()=>{
        // change canvas size
        canvas.width = canvas.parentElement.offsetWidth
        canvas.height = canvas.parentElement.offsetHeight

        mouse.radius = 80 * (window.innerWidth/1366)

        // stop animation
        mustAnimate = false
        window.cancelAnimationFrame(animation1)

        // get pixels information for the new size
        pixels1 = getImagePixels()

        // remove old particles
        particlesArray1 = []
        numberOfParticles1 = setNumberOfParticles()
        // map the particle speed according to the color
        mappedImage1 = getMappedImage()
        // create particles 
        init1()
        // update positions
        animate1()
    })
    
})



