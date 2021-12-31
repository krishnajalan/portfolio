import React from 'react'
import help_descriptions from '../../Resources/constants/help_descriptions.json'

let allCommands = [
    {
        command:/^clear$/,
        arguments:1,
        runFunction:(allPackages)=>{return 'clear'}
    },
    {
        command:/^help$/,
        arguments:1,
        runFunction:(allPackages)=>helpArray()
    },
    {
        command:/^ls$/,
        arguments:1,
        runFunction:(allPackages)=>handleLS(allPackages)
    },
    {
        command:/^cd$/,
        arguments:2,
        runFunction:(allPackages)=>handleCD(allPackages)
    },
    {
        command:/^mkdir$/,
        arguments:2,
        runFunction:(allPackages)=>allPackages.os.mkdir(allPackages)
    },
    {
        command:/^rm$/,
        arguments:2,
        runFunction:(allPackages)=>allPackages.os.rm(allPackages)
    },
    {
        command:/^touch$/,
        arguments:2,
        runFunction:(allPackages)=>allPackages.os.touch(allPackages)
    },
    {
        command:/^open$/,
        arguments:2,
        runFunction:(allPackages)=>handleOPEN(allPackages)
    },
    {
        command:/^su$/,
        arguments:2,
        runFunction:(allPackages)=>handleSU(allPackages)
    },
    {
        command:/^reset$/,
        arguments:1,
        runFunction:(allPackages)=>allPackages.os.reset()
    },
    {
        command:/^ps$/,
        arguments:1,
        runFunction:(allPackages)=>handlePS(allPackages)
    },
    {
        command:/^cat$/,
        arguments:2,
        runFunction:(allPackages)=>handleCat(allPackages)
    },
    {
        command:/^history$/,
        arguments:1,
        runFunction:(allPackages)=>handleHistory(allPackages)
    },
    {
        command:/^!/,
        arguments:1,
        runFunction:(allPackages)=>handleBang(allPackages)  
    },
    {
        command: /^edit$/,
        arguments: 2,
        runFunction: (allPackages) => handleEdit(allPackages)
    },
    {
        command: /^pwd$/,
        arguments: 1,
        runFunction: (allPackages) => handlePWD(allPackages)
    },
    {
        command: /^exit$/,
        arguments: 1,
        runFunction: (allPackages) => "exit"
    }
]

const ParseCommand = (command,allPackages) =>{
    allPackages={...allPackages,commandSelector:command.split(" "),}
    let result = [];
    
    let foundCommand = false;
    allCommands.forEach((commandObj)=>{
        if(allPackages.commandSelector[0].match(commandObj.command)){
            foundCommand = true;
            if(allPackages.commandSelector.length >= commandObj.arguments){
                result = commandObj.runFunction(allPackages);
                return result
            }
            else{
                result = rejectCommand(allPackages.commandSelector.length,commandObj.arguments)
                return result;
            }
        }
    })

    if(!foundCommand)
        result = [<p>{command} is not a recognized command</p>,<p>Type "help" for list of commands<br/>⠀</p>]
   
    return result
}

const handleLS = (allPackages) =>{
    const { os, commandSelector, path } = allPackages;
    let result = [];
    let respond = os.ls(commandSelector[1]||"", path);
    if (respond === -1){
        result.push(<p>ls: {commandSelector[1]}: No such file or directory</p>)
        return result;
    }
    else if (respond === -2){
        result.push(<p>ls: {commandSelector[1]}: Not a directory</p>)
        return result;
    }
    if (respond === "")
        result.push(<p>Can't open {commandSelector[1]}</p>)

    respond.map((item, idx)=>{
        if(item.type === "folder")
            return result.push(<li key={idx} className="I">{item.name}/</li>)
        else
            return result.push(<li key={idx}>{item.name}</li>)
    })
    result.join(' ')
    return [<ol className="ls">{result}</ol>]
}

const handleCD = (allPackages) =>{
    const { os,commandSelector,setPath,path }  = allPackages;
    let result = []
    let newPath = os.cd(commandSelector[1],path);
    if(newPath === "")
        result.push(<p>Can't open {commandSelector[1]}</p>)
    else if (newPath === -1)
        result.push(<p>cd: {commandSelector[1]}: No such file or directory</p>)
    else if (newPath === -2)
        result.push(<p>cd: {commandSelector[1]}: Not a directory</p>)
    else
        setPath(newPath)
    
    return result;
}

const handleCat = (allPackages) =>{
    const { os,commandSelector ,path }  = allPackages;
    let result = []
    let fileName = commandSelector[1].split('/').slice(-1)[0]
    let filePath = commandSelector[1].split('/').slice(0, -1).join('/')
    
    if (fileName === "") result.push(<p>cat: Invalid File Name Supplied</p>)
    let newPath = os.getfiles(filePath, path);
    if (newPath === -1){
        result.push(<p>cat: {commandSelector[1]}: No such file or directory</p>)
        return result;
    }    
    let found = false;
    for(let i=0; i<newPath.length; i++){
        if(newPath[i].name === fileName){
            found = true;
            if (newPath[i].type === "folder"){
                continue;
            }
            else{
                result.push(<p>{newPath[i].contents}<br/></p>)
                break;
            }
        }
    }
    if (found && result.length === 0){
        result.push(<p>cat: {commandSelector[1]}: is directory</p>)
    }
    return result;
}

const handleEdit = (allPackages) =>{
    const { os,commandSelector,path }  = allPackages;
    let result = []
    let fileName = commandSelector[1].split('/').slice(-1)[0]
    let filePath = commandSelector[1].split('/').slice(0, -1).join('/')

    if (fileName === "") result.push(<p>edit: Invalid File Name Supplied</p>)

    let newPath = os.getfiles(filePath, path);
    if (newPath === -1)
        result.push(<p>edit: {commandSelector[1]}: No such file or directory</p>)
    
    let found = false;
    let item = null;
    for(let i=0; i<newPath.length; i++){
        if(newPath[i].name === fileName){
            found = true;
            if (newPath[i].type === "folder"){
                continue;
            }
            else
                item = newPath[i];
                result.push(<p>opening {newPath[i].contents} to edit<br/></p>)
                break;
        }
    }
    if (found && result.length === 0){
        result.push(<p>edit: {commandSelector[1]}: is directory</p>)
    }
    if (result.length === 0){
        result.push(<p>edit: {commandSelector[1]} not found<br/></p>)
    }

    if (item!==null){
        allPackages.setEditor(true);
        allPackages.setFile(item);
    }   
    return result;
}


const handleOPEN = (allPackages) =>{
    const { os, commandSelector, path } = allPackages;
    let result = [];
    let file = os.open(commandSelector[1],path)
    let owners = file?.owner
    if (commandSelector[1] === "Contact")
            allPackages.addTab(commandSelector[1]);
    if(!owners)
        result.push(<p>{commandSelector[1]} not found<br/>⠀</p>)
    else if(owners.length === 0 || owners.includes(os.user)){
        result.push(<p>Opening {commandSelector[1]}<br/>⠀</p>)
        if (["About", "Experience", "Work", "snakeGame.exe"].includes(commandSelector[1]))
            allPackages.addTab(commandSelector[1]);
    }
    else
        result.push(<p>Permission denied owners: {owners.map((owner)=>owner)}<br/>⠀</p>)

    return result;
}

const handleSU = (allPackages) =>{
    const{ os, path, setPath, commandSelector} = allPackages
    let result = [];
    os.terminalString = path;
    os.su(commandSelector[1])
    
    result.push(<p><b className='I'>Password for {commandSelector[1]}:</b>*******</p>)
    result.push(<p className='I'>Logged in as {commandSelector[1]}!<br/>⠀</p>)
    setPath(os.terminalString)

    return result;
}

const handlePS = (allPackages) => {
    const { tabs } = allPackages;
    let result = [<p className="indented">
                    <b className="I" style={{marginRight: '30px'}}>PID</b>
                    <b className="I" style={{marginRight: '60px'}}>TTY</b>
                    <b className="I" style={{marginRight: '80px'}}>TIME</b>
                    <b className="I" style={{marginRight: '0px'}}>CMD</b>
                </p>];
    
    tabs.map((process)=>(
        result.push(
            <p className="indented">
                <b className="I" style={{marginRight: '30px'}}>{process.pid}</b>
                <b className="I" style={{marginRight: '20px'}}>pts/0</b>
                <b className="I" style={{marginRight: '30px'}}>{secondsToHMS( (new Date().getTime() - process.TIME.getTime())/1000 )}</b>
                <b className="I" style={{marginRight: '0px'}}>{process.name}</b>
            </p>
        )
    ))
    result.push(<br/>)
    return result;
}

const handleHistory = (allPackages) => {
    const histories = allPackages.os.history()
    let result = []
    histories.map(([index, history])=>(
        result.push(
            <p className="indented">
                <b className="I" style={{marginRight: '30px'}}>{index}</b>
                <b className="I" style={{marginRight: '30px'}}>{history}</b>
            </p>
        )
    ))
    result.push(<br/>)
    return result;
}

const handleBang = (allPackages) => {
    try{
        const commandId = parseInt(allPackages.commandSelector[0].slice(1));
        const command = allPackages.os.histories[commandId];
        return ParseCommand(command,allPackages);
    }catch (err){
        return  [<p>-shell: {allPackages.command}: event not found<br/>⠀</p>]
    }

}

const handlePWD = (allPackages) => {
    const path = allPackages.path.replace('$', '').split(':').slice(-1);
    return [<p>{path}<br/>⠀</p>]
}

function secondsToHMS(secs) {
    secs = secs | 0;
    function z(n){return (n<10?'0':'') + n;}
    var sign = secs < 0? '-':'';
    secs = Math.abs(secs);
    return sign + z(secs/3600 |0) + ':' + z((secs%3600) / 60 |0) + ':' + z(secs%60);
}

const helpArray = () =>{
    let result = help_descriptions.map((commandObj)=>{
        return <p className="indented">
                    <b className='I'>[{commandObj.command}] </b>
                    : {commandObj.description}
                </p>
    })
    result.push(<br/>)
    return result;

}

const rejectCommand = (received,expected) =>{
    return <p>Incorrect Number of arguments. Received: {received}, expected: {expected}<br/>⠀</p>;  
}

export { ParseCommand, allCommands}