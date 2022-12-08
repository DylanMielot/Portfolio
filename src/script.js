import './css/style.css'
import './css/cards.css'
import './css/header.css'
import './css/background.css'
import './css/responsivity.css'
import './css/3dMarker.css'
import './css/loader.css'
import './scripts/vanilla-tilt.min.js'
import {Marker3DAnimation} from './scripts/3dMarker.js'
import { animationManager, imageParticleAnimation, CSSAnimation } from './scripts/animationManager.js'

window.onload = (event) => {
    let cards = document.querySelectorAll(".card")
    let cardContainer = document.querySelector("#cardContainer")
    let canScroll = true
    let progressBarFill = document.querySelector("#progressBarFill")
    let loaderSkip = document.querySelector("#loaderSkip")

    progressBarFill.style.width = "5%";

    

    /***********************************/
    /* ANIMATION MANAGER */
    /***********************************/
    let bgParticles = document.querySelectorAll(".bgParticle")
    let backCanvasContainer = document.querySelector("#backCanvasContainer")
    let bgAnimation = new CSSAnimation(bgParticles)

    let textCover = document.querySelectorAll(".p2")
    let textAnimation = new CSSAnimation(textCover)

    let coverImage = require("./images/me.jpg")
    let coverCanvas = document.querySelector("#canvas1")
    let coverAnimation = new imageParticleAnimation(coverCanvas, coverImage)

    let markerCanvas = document.querySelector('#canvas2')
    let marker = new Marker3DAnimation(markerCanvas)

    let neonCube1 = document.querySelector('#neonCube1')
    let neonCube2 = document.querySelector('#neonCube2')
    let neonCubeAnimation = new CSSAnimation([neonCube1, neonCube2])

    coverAnimation.animateWhenIsAnimated([textAnimation, neonCubeAnimation])
    animationManager.manage(marker, [animationManager.onScreen], markerCanvas)
    animationManager.manage(coverAnimation, [animationManager.onScreen, animationManager.onLoad], coverCanvas)
    animationManager.manage(bgAnimation, [animationManager.onScreen], backCanvasContainer)

    animationManager.startManaging()

    /***********************************/
    /* OBSERVER FOR HIDDEN BLOCKS */
    /***********************************/
    const observer = new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
            if(entry.isIntersecting){
                entry.target.classList.add('show')
            } else {
                entry.target.classList.remove('show')
            }
        })
    })
    const hiddenElements = document.querySelectorAll(".hidden")
    hiddenElements.forEach((el)=> observer.observe(el))



    /***********************************/
    /* CARDS SETTINGS */
    /***********************************/
    cardContainer.addEventListener("wheel", (evt) => {

        if(evt.deltaY > 0){
            if(cardContainer.scrollLeft < cardContainer.offsetWidth * 1.7){
                evt.preventDefault();
                if(canScroll){
                    cardContainer.scrollLeft += cardContainer.children[0].children[0].offsetWidth
                    canScroll = false
                    setTimeout(()=>{
                        canScroll = true
                    }, 500)
                }
            }
        } else {
            if(cardContainer.scrollLeft > 10){
                evt.preventDefault();
                if(canScroll){
                    cardContainer.scrollLeft += -cardContainer.children[0].children[0].offsetWidth
                    canScroll = false
                    setTimeout(()=>{
                        canScroll = true
                    }, 500)
                }
            }
        }

    });

    progressBarFill.style.width = "40%";

    cards.forEach((card)=>{
        if(Array.from(card.classList).includes("card1")){
            let color = "#ffae19"
            card.querySelectorAll(".lastupdateCard")[0].style.color = color
            card.querySelectorAll(".statsCard")[0].style.backgroundColor = color
        }
        if(Array.from(card.classList).includes("card2")){
            let color = "#1AA7C6"
            card.querySelectorAll(".lastupdateCard")[0].style.color = color
            card.querySelectorAll(".statsCard")[0].style.backgroundColor = color
        }
        if(Array.from(card.classList).includes("card3")){
            let color = "#32a873"
            card.querySelectorAll(".lastupdateCard")[0].style.color = color
            card.querySelectorAll(".statsCard")[0].style.backgroundColor = color
        }
    })


    progressBarFill.style.width = "65%";



    /***********************************/
    /* LOADER ANIMATION */
    /***********************************/
    progressBarFill.style.width = "calc(100% - 2px)";
    setTimeout(()=>{
        progressBarFill.parentElement.style.display = "none";
        progressBarFill.parentElement.parentElement.classList.add("endLoading")
        loaderSkip.style.display = "block"
        setTimeout(()=>{
            skipIntro()
        }, 15000)
    }, 1500)
};