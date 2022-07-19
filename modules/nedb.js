const path = require("path")


const Datastore = require('nedb')
import Utils from './utils.js'

let NEDB = {}

//to store dbpath and db later
let previous = {
    dbpath: null,
    db: null
}
let dbs = {} //hold open dbs to avoid concurrency

//----------------D---------//
function deleteDoc(keys, dbpath){
    return new Promise((resolve,reject)=>{
      let check = Utils.fileExists(dbpath)
      if(!check) reject(null)

      let db = getDB(dbpath)
      db.remove(keys, {}, (err, numRemoved)=>{
        if(err) reject(err)
        else if(numRemoved == 0) reject("no doc matched for deletion!") 
        else resolve(numRemoved)
      })
    })
}
NEDB.deleteDoc = deleteDoc


//---------------G---------//
//Please check if file exists before calling this function!
function getDB(dbpath){
    let db

    if(dbpath in dbs) return dbs[dbpath]
    else {
      const db = new Datastore({filename: dbpath})
      db.loadDatabase()
      dbs[dbpath] = db
      return db
    }
}

function getDBPath(text, dbfolder){
    return new Promise((resolve, reject)=>{
      processText(text, dbfolder)
        .then(result => Utils.getDBPathFromFolder(result.folderpath, result.firstchar, text))
        .then(dbpath => resolve(dbpath))
        .catch(err=>{
          if(err == "invalidfirstcharacter"){
            //create new dbfolder
            console.log("creating new dbfolder!")
            let firstchar = [...text][0]
            let ask = confirm("do you want to create new folder in "+dbfolder+" with "+firstchar+"?")
            if(ask){
              const folderpath = path.join(dbfolder,firstchar,"/")
              Utils.getDBPathFromFolder(folderpath, firstchar, text).then(dbpath => resolve(dbpath))
              .catch(newerr => reject(newerr))
            }
          }
          else reject(err)
        })
    })
}

function getDocs(db,keys){
    return new Promise((resolve,reject)=>{
      if(keys){
        db.find({$and: keys}).sort({startdate: 1}).exec((err, docs)=>{
          resolve(docs)
        })
      }
      else{
        db.find({}).sort({startdate: 1}).exec((err, docs)=>{
          resolve(docs)
        })
      }
        
    })
}
NEDB.getDB = getDB
NEDB.previous = previous //to store previdous dbpath and db
NEDB.getDocs = getDocs
NEDB.getDBPath = getDBPath


//----------------I---------//
function insertDoc(doc, dbpath){
    return new Promise((resolve,reject)=>{
      let check = Utils.fileExists(dbpath)
      if(!check) reject(null)

      let db = getDB(dbpath)
      db.insert(doc, (err, newdoc)=>{
        if(err) reject(err)
        else resolve(newdoc)
      })
    })
}
NEDB.insertDoc = insertDoc

export default NEDB