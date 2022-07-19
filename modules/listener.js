
import UIM from './ui.js'
const { ipcRenderer } = require('electron')

let Listener = {}



function onclickListeners(){
    document.onclick = async (e)=> {
        if (e.target.matches("#convert2data")) UIM.texttoData()
        else if(e.target.matches("#showcal")) UIM.showCalendar()//showcal
        else if(e.target.matches("#clear")) UIM.clearCalendar()//showcal
        else if(e.target.matches("#prev")) UIM.showPreviousCalendar()//showcal//prev
        else if(e.target.matches("#next")) UIM.showNextCalendar()//showcal//next

        else if(e.target.matches(".addeventbtn")) UIM.showEventInputDiv(e)
    }
}
Listener.onclickListeners = onclickListeners

function setKeyListeners(){
    let input = document.getElementById("input")
    input.onkeydown = (e)=>{
        if(e.key === 'Enter') UIM.showCalendar()
    }
    
    document.onkeyup = (e)=>{
        if(e.key === 'ArrowLeft') UIM.showPreviousCalendar()
        else if(e.key === 'ArrowRight') UIM.showNextCalendar()
        else if(e.key === 'Escape') UIM.hideFloatings()
    } 
}
Listener.setKeyListeners = setKeyListeners

function setIpcRendererOn(){
    ipcRenderer.on("showAbout",(event)=>{
       // UIM.showAbout()
    })
}
Listener.setIpcRendererOn = setIpcRendererOn

export default Listener