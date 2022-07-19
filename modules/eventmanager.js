
import NEDB from './nedb.js'
import Utils from './utils.js'

let EVM = {}



let evmdb = "./db/evdb.db"

class Event{
    constructor(title,description,places,startdate,enddate){
        this.title = title
        this.description = description
        this.places = places
        this.startdate = startdate
        this.enddate = enddate
    }
}


async function getEvents(){
    let keys = null //[{firstword:firstword},{lastword:lastword}]

    let check = Utils.fileExists(evmdb)
    if(!check) return null 

    const db = NEDB.getDB(evmdb) //open or create db 
    let docs = await NEDB.getDocs(db,keys)
    return docs
}
EVM.getEvents = getEvents

function insertEvent(event){
    //const {...object} = event
    console.log(event)
    //return
    return new Promise((resolve,reject) =>{
        //Here no need to check the dbpath,
        //because if not found, it will automatically create a new one.

        const db = NEDB.getDB(evmdb) //open or create db 
        db.insert(event, (err, newdoc)=>{
            if(err) reject(null)
            else resolve(newdoc)
        })
    })
}
function deleteEvent(eventid){
    //const {...object} = event
    //console.log(event)
    //return
    return new Promise((resolve,reject) =>{
        let check = Utils.fileExists(evmdb)
        if(!check) reject(null)

        const db = NEDB.getDB(evmdb) //open or create db 
        db.remove({_id: eventid}, {}, (err, numRemoved)=>{
            if(err) reject(err)
            else if(numRemoved == 0) reject("no doc matched for deletion!") 
            else resolve(numRemoved)
        })
    })
}
function updateEvent(eventid, newevent){
    return new Promise((resolve,reject) =>{
        let check = Utils.fileExists(evmdb)
        if(!check) reject(null)
        
        const db = NEDB.getDB(evmdb) //open or create db 
        db.update({_id: eventid}, newevent, {}, (err, numReplaced)=>{
            if(err) reject(err)
            else if(numReplaced == 0) reject("no doc updated!") 
            else resolve(numReplaced)
        })
    })
}
EVM.deleteEvent = deleteEvent
EVM.insertEvent = insertEvent
EVM.updateEvent = updateEvent

export default EVM