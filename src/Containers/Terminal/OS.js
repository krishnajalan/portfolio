import React from 'react'

import default_files from '../../Resources/constants/default_files.json'
import { isMobile } from 'react-device-detect'
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

    ls(){
        return this.currentDirectory
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

        const filterArray=(a,b)=>{return a.filter((e)=>{return e!==b})}
        let locations = filterArray(parameters.replaceAll('.', '').split('/'),"")
        let cumalitivePath = absoluteSystemPath.join('/')


        for(let i = 0; i < locations.length;i++){
            let fileName = locations[i];
            let found = false;
            for(let j = 0; j < this.currentDirectory.length; j++){
                let item = this.currentDirectory[j]
                if(item.name === fileName && item.type === 'folder'){
                    found = true;
                    this.pwd = item.path
                    this.currentDirectory = item.children;
                    
                    cumalitivePath += '/' + item.name
                    cumalitivePath = cumalitivePath.replaceAll(' ','')
                }
            }
            if (!found)return -1;
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
                if(item.name === fileName && item.type === 'folder'){
                    temp = item.children;
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
        let absoluteSystemPath = path.split('/')

        if (filterArray(commandSelector[1].split('/')).length > 1)
            return [<p>mkdir: Recursive directory creation not supported</p>, <br></br>];
            
 
        for (let i = 0; i < this.currentDirectory.length; i++) {
            let item = this.currentDirectory[i]
            if (item.name === commandSelector[1] && item.type === 'folder') {
                return [<p>mkdir: directory '{commandSelector[1]}' already exists</p>, <br></br>];
            }
        }
        this.currentDirectory.push(
            {
                "type" : "folder",
                "name" : commandSelector[1],
                "path" : "/" + absoluteSystemPath[absoluteSystemPath.length - 2],
                "privileges" : ["read","write","execute"],
                "owner" : [this.user],
                "children":[]
            }
        )
        this.tree[absoluteSystemPath] = this.currentDirectory
        saveData(this.tree)
        
    }

    touch(allPackages){
        const { path, commandSelector } = allPackages
        let absoluteSystemPath = path.split('/')
        this.currentDirectory.push(
            {
                "type" : "file",
                "name" : commandSelector[1],
                "path" : "/" + absoluteSystemPath[absoluteSystemPath.length - 2],
                "privileges" : ["read","write"],
                "owner" : [this.user]
            }
        )
        this.tree[absoluteSystemPath] = this.currentDirectory
        saveData(this.tree)
        
    }

    mv(parameters){

    }

    rm(allPackages){
        const { path, commandSelector } = allPackages
        let fileName = commandSelector[1]
        let absoluteSystemPath = path.split('/')
        fileName = fileName.replaceAll('*','.*')
        fileName = '^' + fileName + '$'
        let removedItem = this.currentDirectory.findIndex((el)=>el.name.match(fileName))
        while(removedItem >= 0){

            let permissions = this.currentDirectory[removedItem].owner
            let permissionsCheck = (permissions.length === 0 || permissions.includes(this.user))

            if(permissionsCheck){
                this.currentDirectory.splice(removedItem,1)
                this.tree[absoluteSystemPath] = this.currentDirectory
                saveData(this.tree)
            }
            removedItem = this.currentDirectory.findIndex((el)=>(el.name.match(fileName) && permissionsCheck)) 
        }
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


