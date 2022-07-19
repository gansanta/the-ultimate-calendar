/**
* User interface manager
* */

import EVM from './eventmanager.js'

let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
let palimonths = ["Phussa","Māgha","Phagguna","Citta","Vesākha","Jeṭṭha","Asaḷha","Sāvana","Bhadda","Assayuja","Kattika","Māgasira",]
let eclipses = ["T","A","H","P","t","p","n"]

const UIM = {}

//consider BBD as Buddha's date of birth
let BBD 

//---------------------------A------------------------//

function addHeaderRow(table){
    let newRow = table.insertRow(-1) //add row
    let weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    for(let day of weekdays){
        let th = document.createElement("th")
        th.setAttribute("class", "calth")
        th.innerHTML = day

        newRow.appendChild(th)
    }
}

function addRow(table) {
    let newRow = table.insertRow(-1)
    
    let celllist = []
    for(let i=0; i<=6; i++){//add cells
        let td = document.createElement("td")
        td.setAttribute("class", "caltd")
        td.innerHTML = " "

        newRow.appendChild(td)
        celllist.push(td)
    }
    return celllist

}



//------------------C----------------------//

// clear table divs
function clearCalendar(){
    let tablediv2s = document.querySelectorAll(".tablediv2")
    for(let tdiv of tablediv2s) tdiv.parentElement.removeChild(tdiv)

    let h3s = document.getElementsByTagName("h3")
    for(let h3 of h3s) h3.parentElement.removeChild(h3)
}
function clearInputDiv(){
    //document.querySelector(".evinputdiv").innerHTML = ""
    document.querySelector(".evinputdiv").style.display = "none"
}
function createEventInputDiv(){

    let evinputdiv = document.createElement("div")
    evinputdiv.classList.add("evinputdiv")
    evinputdiv.style.display = "flex"

    //title input
    let titleinput = document.createElement("input")
    titleinput.id = "evtitleinput"
    titleinput.type = "search"
    titleinput.placeholder = "Event title"
    evinputdiv.appendChild(titleinput)

    //input for event descripiton 
    let textarea = document.createElement("textarea")
    textarea.placeholder = "Event description"
    textarea.id = "evdescrinput"
    evinputdiv.appendChild(textarea)

    //start date
    let label = document.createElement("label")
    label.innerHTML = "Start date"
    evinputdiv.appendChild(label)
    let startdateinput = document.createElement("input")
    startdateinput.type = "search"
    startdateinput.placeholder = "eg: -00600/01/01"
    startdateinput.title = "For BCE: -00600/01/01, For CE: 99/01/06"
    startdateinput.id = "startdateinput"
    evinputdiv.appendChild(startdateinput)

    //end date
    let label2 = document.createElement("label")
    label2.innerHTML = "End date"
    evinputdiv.appendChild(label2)
    let enddateinput = document.createElement("input")
    enddateinput.type = "search"
    enddateinput.placeholder = "eg: 99/01/06"
    enddateinput.title = "For BCE: -00600/01/01/BCE, For CE: 99/01/06"
    enddateinput.id = "enddateinput"
    evinputdiv.appendChild(enddateinput)

    //places
    let label3 = document.createElement("label")
    label3.innerHTML = "Location"
    evinputdiv.appendChild(label3)
    let placeinput = document.createElement("input")
    placeinput.type = "search"
    placeinput.placeholder = "newyork;otawa;..."
    placeinput.id = "placeinput"
    evinputdiv.appendChild(placeinput)

    //buttons
    let buttondiv = document.createElement("div")
    buttondiv.classList = "evinputbuttondiv"
    let okbutton = document.createElement("button")
    okbutton.id = "evokbutton"
    okbutton.innerHTML = "OK"
    okbutton.onclick = async ()=> {
        let event = getEvent()
        if(event) {
            if(okbutton.innerHTML == "Update"){
                let eventid = evinputdiv.getAttribute("eventid")
                if(eventid){
                    let update = EVM.updateEvent(eventid,event)
                    if(update) {
                        new AWN().success("Event updated successfully")
                        await showEvents()
                        clearInputDiv()
                    }
                    else {
                        new AWN().warning("Event insertion failed!")
                    }
                }
            }
            else {
                let inserteddoc = await EVM.insertEvent(event)
                if(inserteddoc) {
                    new AWN().success("Event inserted successfully")
                    await showEvents()
                }
                else {
                    new AWN().warning("Event insertion failed!")
                }
            }
            
        }
    }
    let cancelbutton = getCloseButton()

    buttondiv.appendChild(okbutton)
    buttondiv.appendChild(cancelbutton)
    evinputdiv.appendChild(buttondiv)

    let infodiv = document.createElement("div")
    evinputdiv.appendChild(infodiv)

    document.body.appendChild(evinputdiv)

    return evinputdiv    

    function getEvent() {
        let title = titleinput.value
        let testing = false

        if (!testing && (title == null || title == "")) {
            infodiv.innerHTML = "title undefined!"
            return null
        }

        let descripiton = textarea.value
        if (!testing && (descripiton == null || descripiton == "")) {
            infodiv.innerHTML = "descripiton undefined!"
            //return null
        }
        
        let startdate = startdateinput.value
        if (!testing && (startdate == null || startdate == "")) {
            infodiv.innerHTML = "startdate undefined!"
            return null
        }
        
        let enddate = enddateinput.value
        if (!testing && (enddate == null || enddate == "")) {
            infodiv.innerHTML = "enddate undefined!"
            return null
        }
        
        let places = placeinput.value
        if (!testing && (places == null || places == "")) {
            infodiv.innerHTML = "places undefined!"
            //return null
        }
        
        let event = {
            title:title,
            descripiton:descripiton,
            places:places,
            startdate:startdate,
            enddate:enddate
        }
        
        infodiv.innerHTML = "" //reset

        return event
    }
}

UIM.clearCalendar = clearCalendar



//-------------------F-------------------------//
/**
 * 
 * @param {*} myear year
 * @param {*} lunardates array of dates with lunar phases for the whole year 
 */
 function fillTheCalendar(myear, isAdhimasa=null, lunardates=null){
    let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    
    let outputdiv = document.getElementById("outputdiv")
    //--------show a year heading-------------
    let h3 = document.querySelector(".yearheading")
    h3.innerHTML = ""//clear reset
    let yearbcad = getAbsoluteYear(myear)
    
    let yearheading = yearbcad
    if(isAdhimasa) yearheading += " (Adhimāsa)"
    h3.innerHTML = yearheading

   
    //--------------show calendar------------------------
    let tablediv2 = document.querySelector(".tablediv2")
    if(!tablediv2){
        tablediv2 = document.createElement("div")
        tablediv2.setAttribute("class","tablediv2")
        outputdiv.appendChild(tablediv2)
    }
    else tablediv2.innerHTML = "" //clear reset
    

    var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            
    for(let m=0; m<12; m++){
        
        let firstdate = getDate(myear,m,1)
        Date.prototype.getWeekDay = function() {
            return weekday[this.getDay()]
        }
        //let firstday = firstdate.getWeekDay()
        let firstdayval = firstdate.getDay()

        let modifiedmindex = m+1
        if(modifiedmindex>11) modifiedmindex = 0

        let monthlastdate = getDate(myear,modifiedmindex,0)// new Date(2025, 2, 0)
        let monthdays = monthlastdate.getDate()
        
        let rowstartday = firstdayval
        

        //create table for each month
        let table = document.createElement("table")
        table.setAttribute("class","caltable")
        
        //set month caption
        let caption = table.createCaption()
        caption.innerHTML = months[m]+", "+yearbcad

        tablediv2.appendChild(table)

        //add name of the weekdays
        addHeaderRow(table)

        let tdlist = []
        for(let i=0; i<6;i++){ //add 6 rows
            let celllist = addRow(table)
            tdlist.push(...celllist)
        }

        let dayarray = Array.from({length: monthdays}, (v, k) => k+1)
        let daycounter = 0

        let monthlundates = null
        if(lunardates) monthlundates = lunardates.filter(ld => ld.month == months[m])


        for(let i=0; i<tdlist.length;i++){
            if(i >= rowstartday && daycounter < dayarray.length){
                let html = dayarray[daycounter]

                //add moon phase if found
                if(monthlundates) {
                    let lundate = monthlundates.find(ld=> ld.day == dayarray[daycounter])
                    if(lundate) html += " "+lundate.phase[2] + "<br>"+lundate.palimonth
                } 

                tdlist[i].innerHTML = html

                daycounter++
            }
            

        }
    }
    
}


//----------------G-----------------------//
function getCloseButton(){
    let button = document.createElement("button")
    button.classList = "closebutton"
    button.innerHTML = "Cancel"
    
    button.onclick = (e)=>{
      e.preventDefault()
      clearInputDiv()
    }
    return button
}
function getDate(year, month,day,time="00:00",eclipse=""){
    //format for BCE date
    if(year.startsWith("-")){
        let zeros_to_be_added = 7 - year.length
        let zeros = ""
        for(let i=1; i<=zeros_to_be_added;i++){
            zeros += 0
        }
        year = year[0] + zeros + year.slice(1) 
    }

    //let thisdate = year+"/"+month+"/"+day
    let thisdate = year+"-"+month+"-"+day+"T"+time+":00"//T03:24:00

    let timesplit = time.split(":")
    

    let date2 = new Date(year, month, day, timesplit[0],timesplit[1],"00") // 1995, 11, 17, 13, 24, 0
    return date2
}


function getFirstMoonPhase(val){
    let first_phaseval = null

    // fdindex = 45 fullmoon, 63 lastquarter, 9 newmoon, 27 firstquarter
    //
    let phases = {9:"New Moon",27:"First Quarter",45:"Full Moon",63:"Last Quarter"}
    let phasevals = Object.keys(phases)

    let valchars = [...val]
    for(let i=0; i<valchars.length;i++){
        if(i>6 && valchars[i] != " ") { //skip year chars
            return i
        }
    }
}

/**
 * 
 * @param {*} val == text
 * @returns phases[[numberofspaces,phasename,phaseicon]]
 */
function getPhases(val){
    let fphaseval = getFirstMoonPhase(val)
    let phases = [[9,"New Moon","🌑"],[27,"First Quarter","🌓"],[45,"Full Moon","🌕"],[63,"Last Quarter","🌗"]]
    
    let counter = 0 //counter
    while(counter <phases.length && fphaseval != phases[0][0]){
        
        let phase = phases[0]
        phases.shift() //remove it
        phases.push(phase) //add it at the end

        counter++
    }
    return phases
}

function getMoonPhaseOfDate(datecounter, phases){
    let phasecounter = (datecounter-1)/4
    let integr = Math.floor(phasecounter)
    let decimal = phasecounter - integr
    
    if(decimal == 0) return phases[0]
    else if(decimal == 0.25) return phases[1]
    else if(decimal == 0.5) return phases[2]
    else if(decimal == 0.75) return phases[3]
    else return null
}

function getLunarDates(year, val){
    //rearrange moon phases for the year
    let phases = getPhases(val)//eg [[9,"Full moon", phaseicon]]

    val = val.replace(/\s+/g, " ").trim()
    let valsplits = val.split(" ")
    
    //show dates, starting from val 1
    let dates = []
    let fullmoondates = []
    let fullmooncounter = 0
    
    let datecounter = 1 //start with first date
    let i=1
    while(i<valsplits.length){
        let month = valsplits[i]
        let date = valsplits[i+1]
        let time = valsplits[i+2]

        //check for eclipse in the text
        let eclipsecheck = valsplits[i+3]
        let eclipse = ""
        if(eclipses.includes(eclipsecheck)){
            i = i+4//skip it
            eclipse = eclipsecheck
        }
        else {
            i = i +3
        }

        let gregdate = getDate(year,months.indexOf(month),date,time,eclipse)

        //also find moon phase
        let phase = getMoonPhaseOfDate(datecounter, phases)
        if(phase[1] == "Full Moon") {
            let monthindex = fullmoondates.findIndex(fmd => fmd.month == month)
            if(monthindex>=0) {
                fullmoondates[monthindex].fullmoondate.push(gregdate)
            }
            else fullmoondates.push({month:month, fullmoondate:[gregdate]})

            fullmooncounter++
        }

        dates.push({gregdate:gregdate,year:year, month:month,day:date,time:time,phase:phase})

        datecounter++
    }
    return {dates: dates, fullmoondates:fullmoondates, fullmooncounter:fullmooncounter}
}

/**
 * 
 * @param {*} val raw text data of lunar phases for a century
 */
function getModifiedDates(dates, fullmoondates,fullmooncounter){
    
    let isAdhimasa = false
    let doublefullmoonmonth = null
    if(fullmooncounter>12) {
        isAdhimasa = true
        let fmonth = fullmoondates.find(fmd => fmd.fullmoondate.length>1)
        doublefullmoonmonth = fmonth
    }
    
    
    let palimonthsequence = []
    let firstfullmoondateindex = dates.findIndex(d=>d.phase[1] == "Full Moon")
    let monthcounter = 0
    let daycounter = 0

    for(let i=0; i<dates.length; i++){
        if(monthcounter > 11) monthcounter = 0 //reset to repeat the month

        //to sequence it, you have to know the first full moon date
        //and then check whether the date is before or after t
        if(monthcounter == 0){
            if(i<firstfullmoondateindex){
                palimonthsequence.push(palimonths[monthcounter])
            }
            else if(i == firstfullmoondateindex){
                palimonthsequence.push(palimonths[monthcounter])
                monthcounter++
            }
            else palimonthsequence.push(palimonths[monthcounter])
        }
        
        else {
            if(daycounter < 3){
                palimonthsequence.push(palimonths[monthcounter])
                //add one extra date 
                if(monthcounter == 5 && isAdhimasa) palimonthsequence.push(palimonths[monthcounter])
                daycounter++
            }
            else if(daycounter == 3){
                if(monthcounter == 5 && isAdhimasa) palimonthsequence.push(palimonths[monthcounter])
                
                palimonthsequence.push(palimonths[monthcounter])
                daycounter = 0 //reset for the next month
                monthcounter++
            }
        }

    }

    //add palimonth to dates
    palimonthsequence = palimonthsequence.filter(p => p)
    for(let i=0; i<dates.length; i++){
        //let dd = moment(dates[i].gregdate).format('DD MMM YYYY, ddd, h:mm a')
        dates[i].palimonth = palimonthsequence[i]
    }
    
    return {isAdhimasa:isAdhimasa, dates: dates}

}

/**
 * 
 * @param {*} year 
 * @returns year+"BC" or year+"AD"
 */
function getAbsoluteYear(year){
    let absoluteyear = year
    if(year.startsWith("-")){
        absoluteyear = Math.abs(parseInt(year)) + " BC"
    }
    else if(Math.abs(parseInt(year)) == 0){
        absoluteyear =  "1 BC" //exceptional case
    }
    else {
        absoluteyear = Math.abs(parseInt(year)) + " AD"
    }
    return absoluteyear
}
async function getEventDates(){
    let events = await EVM.getEvents()
    if(!events) return null

    let eventdates = []
    for(let ev of events){
        let startdate = new Date(ev.startdate)
        eventdates.push({startdate:startdate,event:ev})
    }
    let docascends = eventdates.sort((a,b)=>a.startdate.getTime()-b.startdate.getTime())
    return docascends
}
function getYearADorBC(event){
    let startdate = new Date(event.startdate)
    let year = startdate.getFullYear()
    let absyear = Math.abs(year)

    let yearadbc = absyear+""
    if(year <0) yearadbc += " BC"
    else yearadbc += " CE"

    return yearadbc
}
function getAddRemoveMenu(e, td){
    let div = document.createElement("div")
    div.setAttribute("class", "addremovediv")
    
    div.style.top = (e.clientY+10)+"px"
    div.style.left = e.clientX+"px"
    div.style.display = "flex"

     //create add and remove li
     let adddiv = document.createElement("div")
     adddiv.innerHTML = "+"
     adddiv.setAttribute("title","add")
     adddiv.setAttribute("class","adddiv")
     adddiv.onclick = async (e)=>{
        td.removeChild(div)
        await showEventInputDiv(e)
     }
 
     let removediv = document.createElement("div")
     removediv.innerHTML = "-"
     removediv.setAttribute("title","remove")
     removediv.setAttribute("class","removediv")
     removediv.onclick = async ()=>{
         td.removeChild(div)
         let eventid = td.getAttribute("eventid")
        let deletion = await EVM.deleteEvent(eventid)

        

        if(deletion) {
            //let mode = "reload"
            await showEvents()
        }
     }

    div.appendChild(adddiv)
    div.appendChild(removediv)

    return div
}
function getEventRow(event=null){
    let tr = document.createElement("tr")

    //year column
    let yeartd = document.createElement("td")
    yeartd.setAttribute("class","yearcolumn")
    tr.appendChild(yeartd)

    //title column
    let titletd = document.createElement("td")
    titletd.setAttribute("class","titlecolumn")
    tr.appendChild(titletd)
    
    if(event){
        let year = getYearADorBC(event)
        yeartd.innerHTML = year
        titletd.innerHTML = event.title
        titletd.title = event.descripiton //tooltip for description

        yeartd.setAttribute("eventid", event._id)

        yeartd.oncontextmenu = (e)=>{
            hideFloatings()
            let addremovediv = getAddRemoveMenu(e, yeartd)
            yeartd.appendChild(addremovediv)
        }


        //set titletd doubleclick edit
        titletd.ondblclick = (e)=>{
            showEventInputDiv(e, "edit", event)
        }
    }


    return tr
}



/*
function getBuddhaYear(year){
    let buddhaera = ""
    let absoluteyear = Math.abs(parseInt(year))

    if(year.startsWith("-")){
        if(absoluteyear > ){}
    }
    else if(Math.abs(parseInt(year)) == 0){
        absoluteyear =  "1 BC" //exceptional case
    }
    else {
        absoluteyear = Math.abs(parseInt(year)) + " AD"
    }
    return absoluteyear
}
*/

//------------------------H--------------------//
function hideFloatings(){
    let replydivs = document.querySelectorAll(".replydiv")
    replydivs.forEach(rd=>{rd.parentElement.removeChild(rd)})

    let addremovedivs = document.querySelectorAll(".addremovediv")
    addremovedivs.forEach(ard=>{ard.parentElement.removeChild(ard)})
    
}
UIM.hideFloatings = hideFloatings

//-----------------S------------------------------//
function setBuddhaBirthDate(){

}
//showCalendar
function showCalendar(){
    //get input year
    let input = document.getElementById("input")
    if(!input.value) return 

    
    let isAdhimasa = null
    let year = input.value
    let mathyear = parseInt(input.value)
    
    let lunardata = getYearlyMoonData(mathyear)
    
    //adjust BC year
    //if the year starts with - sign, increase by 1
    //because the input is from http://astropixels.com/ephemeris/phasescat/phases-0699.html
    //where for BC dates, year 0 is equivalent to 1BC, 
    //and so 622 is equivalent to 623BC
    //we will need the exact BC year, not what that website uses,
    //so increase the year by 1 to get the BC year.
    if(year.startsWith("-")) {
        let absyear = Math.abs(mathyear)+1
        year = "-"+absyear
    }

    let lunardates = null //placeholder for lunar dates
    if(lunardata){
        let {dates, fullmoondates,fullmooncounter} = getLunarDates(year, lunardata)
        //get dates with palimonths
        let modifieddates = getModifiedDates(dates, fullmoondates,fullmooncounter)
        lunardates = modifieddates.dates
        isAdhimasa = modifieddates.isAdhimasa
    }
    
    fillTheCalendar(year,isAdhimasa,lunardates)


}
function showNextCalendar(){
    //get input year
    let input = document.getElementById("input")
    if(!input.value) return 
    
    let value = parseInt(input.value)
    input.value = value + 1 
    
    showCalendar()
}

function showPreviousCalendar(){
    //get input year
    let input = document.getElementById("input")
    if(!input.value) return 

    let value = parseInt(input.value)
    input.value = value - 1 
    showCalendar()
}

async function showEventInputDiv(e, mode="insert", event = null){
    let evinputdiv = document.querySelector(".evinputdiv")
    if(evinputdiv) {
        evinputdiv.style.display = "flex"
    }

    //if no ev inputdiv found, create new one
    else {
        evinputdiv = createEventInputDiv()
    }
    
    if(mode == "edit"){
        evinputdiv.querySelector("#evokbutton").innerHTML = "Update"
        if(event){
            let yeartd = e.target.parentElement.firstChild
            evinputdiv.setAttribute("eventid",yeartd.getAttribute("eventid"))

            evinputdiv.querySelector("#evtitleinput").value = event.title
            evinputdiv.querySelector("#evdescrinput").value = event.descripiton 
            evinputdiv.querySelector("#startdateinput").value = event.startdate  
            evinputdiv.querySelector("#enddateinput").value = event.enddate
            
            evinputdiv.querySelector("#placeinput").value = event.places  
        }

    }
}
async function showEvents(){
    let eventdates = await getEventDates()
    
    //if events are empty, show add event row
    let eventlistdiv = document.getElementById("eventlistdiv")
    eventlistdiv.innerHTML = "" //reset
    
    //create a table
    let table = document.createElement("table")
    eventlistdiv.appendChild(table)

     //insert headings
     let thr = document.createElement("tr")
    
     let th1 = document.createElement("th")
     th1.innerHTML = "Year"
     thr.appendChild(th1)
     let th0 = document.createElement("th")
     th0.innerHTML = "Event"
     thr.appendChild(th0)

     table.appendChild(thr)

    if(eventdates){
        for(let ev of eventdates){
            let row = getEventRow(ev.event)
            table.appendChild(row) //add row to table
        }
    }
    

}

UIM.setBuddhaBirthDate = setBuddhaBirthDate
UIM.showCalendar = showCalendar
UIM.showNextCalendar = showNextCalendar
UIM.showPreviousCalendar = showPreviousCalendar
UIM.showEventInputDiv = showEventInputDiv
UIM.showEvents = showEvents


//-----------------------------T----------------------------------//
//text to data
function texttoData(){

    //activate here by commenting return statement
    //return

    let input = document.getElementById("input")
    let val = input.value
    if(!val) return

    let div = document.createElement("div")
    div.innerHTML = val

    let divchildren = div.childNodes
    let divconchildren = divchildren[0].childNodes
   
    let divs = divchildren[0].querySelectorAll("div.pbox1 div.pbox1a")
   
    let yeardata = []
    
    for(let dv of divs){
        let pre = dv.getElementsByTagName("PRE")[0]
        
        let prechildren = pre.childNodes
        for(let p of prechildren){
            //they all are text
            if(p.length>500) yeardata.push(p.nodeValue)
        }

    }
}
UIM.texttoData = texttoData



export default UIM