import React from 'react'

import default_files from '../../Resources/constants/default_files.json'
import { isMobile } from 'react-device-detect'

import isValidFilename from 'valid-filename';


const initializeLocalStorage = () =>{
    let tree = localStorage.getItem('krishna-jalan-files');
    if(tree !== null)
        return
    
    saveData(default_files)
}


const saveData = (tree, key='krishna-jalan-files') => {
    let stringFileStructure = JSON.stringify(tree)
    localStorage.setItem(key, stringFileStructure)
}

const filterArray=(a,b)=>{return a.filter((e)=>{return e!==b})}
export default class OS extends React.Component {
    user = 'guest'
    tree
    currentDirectory
    histories = [""]
    idx = 0
    pwd = '~'
    terminalString = ((!isMobile)? (this.user + '@KrishnaJalan:'):'') + this.pwd + '$ '


    constructor(props){
        super(props)
        initializeLocalStorage();
        this.tree = JSON.parse(localStorage.getItem('krishna-jalan-files'))
        this.histories = JSON.parse(localStorage.getItem('history')) || [""]
        this.currentDirectory = this.tree
    }

    saveState(){
        saveData(this.tree)
    }

    ls(parameter, path){
        return this.getfiles(parameter, path)
    }

    updateHistory(command){
        this.histories.push(command)
        saveData(this.histories, 'history')
    }

    cd(parameters, path){

        let numberOfReversals = parameters.split('..').length - 1
        path = path.replaceAll('$', '');
        let absoluteSystemPath = path.split('/')
        if(numberOfReversals >= absoluteSystemPath.length)
            return ''

        //console.log('numberofrev:' + numberOfReversals  + 'before')
        //console.log(absoluteSystemPath)
        for(let i = 0; i < numberOfReversals; i++){
            absoluteSystemPath.pop()
        }

        let temp = [...absoluteSystemPath]
        if (numberOfReversals>0){
            let subDirectory = this.tree;
            for(let name in temp){
                name = temp[name]
                let index = -1;
                subDirectory.forEach((item,ind)=>{
                    if(item.name === name && item.type === 'folder')
                        index = ind
                })
                if(index >= 0)
                    subDirectory = subDirectory[index].children;
            }
            this.currentDirectory = subDirectory;
        }

        let locations = filterArray(parameters.replaceAll('.', '').split('/'),"")
        let cumalitivePath = absoluteSystemPath.join('/')
        let backupState = this.currentDirectory;

        for(let i = 0; i < locations.length;i++){
            let fileName = locations[i];
            let found = false;
            for(let j = 0; j < this.currentDirectory.length; j++){
                let item = this.currentDirectory[j]
                if(item.name === fileName){
                    if (item.type === 'folder'){
                        found = true;
                        this.pwd = item.path
                        this.currentDirectory = item.children;
                        
                        cumalitivePath += '/' + item.name
                        cumalitivePath = cumalitivePath.replaceAll(' ','')
                    }
                    else{
                        return -2;
                    }
                }
                
            }
            if (!found){
                this.currentDirectory = backupState;
                return -1;
            }
        }
        return cumalitivePath.replaceAll(' ','')+ '$ ';
    }

    getfiles(parameters, path){
        let numberOfReversals = parameters.split('..').length - 1
        path = path.replaceAll('$', '').replace(' ', '')

        let absoluteSystemPath = path.split('/')
        if(numberOfReversals >= absoluteSystemPath.length)
            return ''

        //console.log('numberofrev:' + numberOfReversals  + 'before')
        for(let i = 0; i < numberOfReversals; i++){
            absoluteSystemPath.pop()
        }

        let temp = [...absoluteSystemPath]
        if (numberOfReversals>0){
            let subDirectory = this.tree;
            for(let name in temp){
                name = temp[name]
                let index = -1;
                subDirectory.forEach((item,ind)=>{
                    if(item.name === name && item.type === 'folder')
                        index = ind
                })
                if (index === -1) return -1;
                if(index >= 0)
                    subDirectory = subDirectory[index].children;
            }
            temp = subDirectory;
        }else{
            temp = this.currentDirectory;
        }
        

        let locations = filterArray(parameters.replaceAll('.', '').split('/'),"")

        for(let i = 0; i < locations.length;i++){
            let fileName = locations[i];
            let found = false;
            for(let j = 0; j < temp.length; j++){
                let item = temp[j]
                if(item.name === fileName){
                    if (item.type === 'folder'){
                        found = true;
                        temp = item.children;
                    }
                    else{
                        return -2;
                    }
                }
            }
            if (!found)return -1;
        }
        return temp;
    }

    history(){
        return Array.from(this.histories.entries()).slice(1).map((item)=>[item[0], item[1]])
    }

    mkdir(allPackages){
        const { path, commandSelector } = allPackages

        let result = []
        let fileName = commandSelector[1].split('/').slice(-1)[0]
        let absoluteSystemPath = commandSelector[1].split('/').slice(0, -1)
        let filePath = absoluteSystemPath.join('/')

        if (fileName ==="" || !isValidFilename(fileName)){
            result.push(<p>mkdir: cannot mkdir {fileName} : Invalid folder name</p>, <br></br>)
            return result
        }

        let directory = this.getfiles(filePath, path)

        if (directory === -1 || !directory) {
            result.push(<p>mkdir: cannot mkdir {filePath}: No such file or directory</p>)
            return result
        }

        for (let i = 0; i < directory.length; i++) {
            let item = directory[i]
            if (item.name === fileName) {
                return [<p>mkdir: '{fileName}' already exists</p>, <br></br>];
            }
        }

        directory.push(
            {
                "type" : "folder",
                "name" : fileName,
                "path" : "/" + absoluteSystemPath[absoluteSystemPath.length - 1],
                "privileges" : ["read","write","execute"],
                "owner" : [this.user],
                "children":[]
            }
        )
        
        saveData(this.tree)
        
    }

    touch(allPackages){

        const { path, commandSelector } = allPackages

        let result = []
        let fileName = commandSelector[1].split('/').slice(-1)[0]
        let absoluteSystemPath = commandSelector[1].split('/').slice(0, -1)
        let filePath = absoluteSystemPath.join('/')

        if (fileName==="" || !isValidFilename(fileName)){
            result.push(<p>touch: cannot touch {fileName} : Invalid file name</p>, <br></br>)
            return result
        }

        let directory = this.getfiles(filePath, path)

        if (directory === -1 || !directory) {
            result.push(<p>touch: cannot touch {filePath}: No such file or directory</p>)
            return result
        }

        for (let i = 0; i < directory.length; i++) {
            let item = directory[i]
            if (item.name === fileName) {
                return [<p>touch: '{commandSelector[1]}' already exists</p>, <br></br>];
            }
        }
        

        directory.push(
            {
                "type" : "file",
                "name" : fileName,
                "path" : "/" + absoluteSystemPath[absoluteSystemPath.length - 1],
                "privileges" : ["read","write"],
                "owner" : [this.user]
            }
        )
        // this.tree[absoluteSystemPath] = this.currentDirectory
        saveData(this.tree)
        
    }

    mv(parameters){

    }

    rm(allPackages){
        const { path, commandSelector } = allPackages

        let result = []
        let fileName = commandSelector[1].split('/').slice(-1)[0]
        let absoluteSystemPath = commandSelector[1].split('/').slice(0, -1)
        let filePath = absoluteSystemPath.join('/')

        if (fileName===""){
            result.push(<p>rm: cannot rm: No filename provided</p>, <br></br>)
            return result
        }

        let directory = this.getfiles(filePath, path)

        if (directory === -1 || !directory) {
            result.push(<p>rm: cannot rm {filePath}: No such file or directory</p>)
            return result
        }

        fileName = fileName.replaceAll('*','.*')
        fileName = '^' + fileName + '$'
        let removedItem = directory.findIndex((el)=>el.name.match(fileName))
        
        if (removedItem === -1){
            result.push(<p>rm: cannot rm {filePath}: No such file or directory</p>)
            return result
        }

        while(removedItem >= 0){

            let permissions = directory[removedItem].owner
            let permissionsCheck = (permissions.length === 0 || permissions.includes(this.user))

            if(permissionsCheck){
                directory.splice(removedItem,1)
            }
            removedItem = directory.findIndex((el)=>(el.name.match(fileName) && permissionsCheck)) 
        }
        saveData(this.tree)
    }

    open(parameters){
        let index = this.currentDirectory.findIndex(el=>el.name === parameters)
        if(index >= 0)
            return this.currentDirectory[index]
        else
            return false
    }

    su(user){
        this.terminalString = this.terminalString.substring(this.terminalString.indexOf('@'))
        this.terminalString = user + this.terminalString;
        this.user = user
    }
    
    reset(){
        saveData(default_files)
        window.location.reload();
    }
}


