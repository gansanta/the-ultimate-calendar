

let Utils = {}

const FS = require("node:fs")

const path = require("path")

//-------------C------------------//
function compareBN(a,b){
    return a.localeCompare(b, 'bn')
}

//-------------F------------------//
function fileExists(filepath){
    try {
        if (FS.existsSync(filepath)) {
          return true
        }
        else return false
    } catch(err) {
        console.error(err)
        return false
    }
}

Utils.fileExists = fileExists


//-------------G------------------//
function getDBPathFromFolder(folderpath, firstchar, palitext){
    return new Promise((resolve, reject)=>{
      if(fileExists(folderpath)){
        FS.readdir(folderpath, (err, files)=>{ //read folder to get db files
          if(err) reject(err)
          else{
            files = files.filter(file=> !file.endsWith("~"))
            files.sort((a,b)=>a.localeCompare(b, "bn")) //sort them
            let dbfile = findfilebnNew(files, palitext)
            const dbpath = path.join(folderpath,dbfile)
            resolve(dbpath)
          }
        })
      }
  
      //if no db file exists, create a db file with firstchar name
      else {
        let dbpath = path.join(folderpath,firstchar)
        resolve(dbpath)
      }
    })
}
function getFilesFromFolder(folderpath){
  return new Promise((resolve, reject)=>{
    console.log(folderpath)

    if(fileExists(folderpath) && FS.statSync(folderpath).isDirectory()){
      FS.readdir(folderpath, (err, files) => {
        let filelist = []
        files.forEach(file => {
          let filepath = path.join(folderpath,file)
          if( FS.statSync(filepath).isFile()) filelist.push({filename:file,filepath:filepath})
        })
        resolve(filelist)
      })
    }
    else resolve([])
  })
  
  
}

function getSelctionRange(){
    let sel, range
    if (window.getSelection) {
      sel = window.getSelection()
      if(sel.rangeCount){
        range = sel.getRangeAt(0)
        range.deleteContents()
      }
    }
    return range
}
Utils.getSelctionRange = getSelctionRange
Utils.getDBPathFromFolder = getDBPathFromFolder
Utils.getFilesFromFolder = getFilesFromFolder

//-------------S------------------//
function splitMulti(str, tokens, tempSplitter="_"){
    //var tempChar = tokens[0]; // We can use the first token as a temporary join character
    for(var i = 1; i < tokens.length; i++){
        str = str.split(tokens[i]).join(tokens[i]+tempSplitter)
    }
    str = str.split(tempSplitter)
    return str
}

Utils.splitMulti = splitMulti

export default Utils