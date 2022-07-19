import UIM from './ui.js'
import Listener from './listener.js'

window.onload = () => init()

function init() {
    Listener.onclickListeners()
    Listener.setKeyListeners()

    UIM.showCalendar()
    UIM.showEvents()
}


