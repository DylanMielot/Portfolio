const canvas = document.querySelector("#backCanvas")
var Welcomecontainer = document.querySelector("#Welcomecontainer")
ctx = canvas.getContext("2d")
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
let mustAnimate3

// Need to add attribute + setAttribute true on mouseover event listener
Welcomecontainer.getAttribute("isAnimated") == "false" ? mustAnimate3= true : mustAnimate3= false

let particlesArray = []
let numberOfParticles = 60
let hue = 0

// get mouse position
let mouse = {
    x: -200,
    y: -200,
    radius: 90
}

canvas.addEventListener("mousemove", (event)=>{
    var rect = event.target.getBoundingClientRect()
    mouse.x = event.x - rect.left
    mouse.y = event.y - rect.top
})

// particle class
class particle{
    constructor(x, y, size){
        this.x = x
        this.y = y
        this.size = size
        this.color = '#000000' //'hsl(' + hue + ', 60%, 50%)'
        this.speed = Math.random() + 0.3
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.closePath()
        ctx.fill()
    }

    update(){
        this.speed *= 1.08
        this.y += this.speed
    }
}

// create particle array

function init() {
    let size = (Math.random() * 3) + 1

    particlesArray.unshift(new particle(mouse.x, mouse.y, size))
}


// animation loop
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for(let i=0; i < particlesArray.length; i++){
        particlesArray[i].draw()
        particlesArray[i].update()
    }
    if(particlesArray.length >= numberOfParticles){
        for(let i=0; i < 1; i++){
            particlesArray.pop()
        }
    }
    init()
    connect()
    hue++
    if(mustAnimate3){
        requestAnimationFrame(animate)
    }
}

function connect(){
    let opacityLine = 1
    for(let a = 0; a < particlesArray.length; a++){
        for(let b = a; b < particlesArray.length; b++){
            let distance = ((particlesArray[a].x - particlesArray[b].x)**2 +
            (particlesArray[a].y - particlesArray[b].y)**2)

            if(distance < (canvas.width/7) * (canvas.height/7)){
                opacityLine = 1 - (distance/15000)
                ctx.strokeStyle = `rgba(10, 10, 10, ${opacityLine})`//'hsla(' + hue + ', 40%, 50%,' + opacityLine +')'
                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y)

                ctx.stroke()
            }
        }
    }
}

init()
animate()

window.addEventListener("resize", ()=>{
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    init()
    animate()
})

canvas.addEventListener("mouseleave", ()=>{
    mouse.x = undefined;
    mouse.y = undefined;
})

Welcomecontainer.addEventListener("mouseleave", ()=>{
    if(!mustAnimate3){
        mustAnimate3 = true
        animate()
    }
})
Welcomecontainer.addEventListener("mouseenter", ()=>{
    mustAnimate3 = false
})