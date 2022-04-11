/**
* User interface manager
* */

let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
let palimonths = ["Phussa","Māgha","Phagguna","Citta","Vesākha","Jeṭṭha","Asaḷha","Sāvana","Bhadda","Assayuja","Kattika","Māgasira",]
let eclipses = ["T","A","H","P","t","p","n"]

const UIM = {}

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
    console.log(dates)
    
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


/**
 * 
 * @param {*} myear year
 * @param {*} lunardates array of dates with lunar phases for the whole year 
 */
function fillTheCalendar(myear, isAdhimasa=null, lunardates=null){
    let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    
    let maincontent = document.getElementById("maincontent")
    
    //--------show a year heading-------------
    let h3 = document.querySelector(".yearheading")
    if(!h3){
        h3 = document.createElement("h3")
        h3.setAttribute("class","yearheading")
        h3.style.textAlign = "center"
        maincontent.appendChild(h3)
    }
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
        maincontent.appendChild(tablediv2)
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

        console.log(monthlundates)


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

        console.log(yeardata)
    }
}
UIM.texttoData = texttoData


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
    
    /*
    if(value <= 0) result = value - 1
    else result = value + 1

    let value = parseInt(input.value)
    let result = null 
    */
    
    
    input.value = value - 1 
    showCalendar()
}

UIM.showCalendar = showCalendar
UIM.showNextCalendar = showNextCalendar
UIM.showPreviousCalendar = showPreviousCalendar



// clear table divs
function clearCalendar(){
    let tablediv2s = document.querySelectorAll(".tablediv2")
    for(let tdiv of tablediv2s) tdiv.parentElement.removeChild(tdiv)

    let h3s = document.getElementsByTagName("h3")
    for(let h3 of h3s) h3.parentElement.removeChild(h3)
}

UIM.clearCalendar = clearCalendar


export default UIM