import React, { useState, Fragment, useEffect, useRef } from 'react';
import './Terminal.css'
import OS from './OS'
import {ParseCommand as CommandParser, allCommands} from './CommandParser'
import starter_command_descriptions from '../../Resources/constants/starter_command_descriptions.json'
import { isMobile } from 'react-device-detect'
import TextEditor from '../../Components/TextEditor/TextEditor.js';

const clear_screen_text = () => {
    let result = []
    return result;
}

var SIGINT = false;
const create_initial_text = () => {

    let result;
    if (isMobile) {
        result = [
            <h3>Krishna Jalan</h3>,
            <h4>This is a Fully Interactive Portfolio Page with a Linux Insprired Terminal (better on PC)<br /></h4>,
            <p>To Begin, Type: help</p>,
        ];
    }
    else {
        result =
            [
                <h2>Krishna Jalan</h2>,
                <h3>This is a Fully Interactive Portfolio Page with a Linux Insprired Terminal<br /></h3>,

                <p>To Use the Portfolio Either <u className="attention">Use the Navigation</u></p>,
                <p>Or <u className="attention">Explore the Terminal</u><br /><br /></p>,

                <p>To Begin, Type:</p>
            ]

    }
    starter_command_descriptions.forEach((command_obj, index) => {
        result.push(<p className="indented"><b className="I">[open {command_obj.name}]</b>: {command_obj.description}</p>)
    })
    result.push(<p className="indented" > <b className="I">[help]</b>: Lists all the command available to use</p>)
    result.push(<br />)
    return result;
}

const handleSpecialKey = (event, allPackages) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    let max = allPackages.os.histories.length;

    if (event.key === "ArrowUp" && allPackages.os.idx>0){
        allPackages.setCommand(allPackages.os.histories[--allPackages.os.idx])
    }
    else if (event.key === "ArrowDown"){
        if (allPackages.os.idx<max-1)
            allPackages.setCommand(allPackages.os.histories[++allPackages.os.idx])
        else
        allPackages.setCommand('')
    }

    else if (event.key === 'Tab') {
        event.preventDefault();
        let input = event.target.value;
        if (input.length > 0 && event.target?.selectionStart === input.length) {
            input = input.split(/\s/);
            if(input.length === 1){
                let commands = [];
                allCommands.map((commandDesc) => {
                        let command = String(commandDesc.command).slice(2, -2);
                        return command.startsWith(input.slice(-1)) && commands.push(command);
                    })
                if (commands.length === 1) {
                    input[input.length-1] = commands[0];
                    input = input.join(' ');
                    allPackages.setCommand(input);
                }else if (commands.length > 1) {
                    let result = [
                        ...allPackages.content,
                        <p>{allPackages.path + allPackages.command}</p>,
                        <ol className="ls">
                            {commands.map((command, idx)=> <li key={idx}>{command}</li>)}
                        </ol>,
                        <br/>
                    ]
                    allPackages.setContent(result);
                }
            }
            else if (input.length > 0){
                let command = input[input.length-1];
                
                let fileName = command.split('/').slice(-1)[0]
                let filePath = command.split('/').slice(0, -1).join('/')

                
                let files = allPackages.os.ls(filePath || "", allPackages.path)
                let matchFile = files.filter( (file) => file.name.startsWith(fileName))
                if ( !filePath ) filePath = '.'
                if (matchFile.length === 1) {
                    input[input.length-1] = filePath+'/'+ matchFile[0].name;
                    if (matchFile[0].type === 'folder') input[input.length-1] += '/'
                    input = input.join(' ');
                    allPackages.setCommand(input);
                }
                else if (matchFile.length > 1) {
                    let result = [
                        ...allPackages.content,
                        <p>{allPackages.path + allPackages.command}</p>,
                        <ol className="ls">
                            {matchFile.map((file, idx)=>
                            {
                                if(file.type === "folder")
                                    return <li key={idx} className="I">{file.name}/</li>
                                else
                                    return <li key={idx}>{file.name}</li>
                                }
                            )}
                        </ol>,
                        <br/>
                    ]
                    allPackages.setContent(result);
                }
            }
        }
    }

    else if (event.ctrlKey && charCode === 'l') {
        allPackages.command = "clear";
        terminalSubmit(event, allPackages);
    }
    else if (event.ctrlKey && charCode === 'c') {
        allPackages.command += "^C";
        SIGINT = true;
        terminalSubmit(event, allPackages);
    }
    // For MAC we can use metaKey to detect cmd key
    else if (event.metaKey && charCode === 'c') {
        allPackages.command = "clear_text";
        terminalSubmit(event, allPackages);
    }
    else{
        
    }
}

const updateTerminalLine = (event, allPackages) => {
    let input = event.target.value;
    allPackages.setCommand(input);
}

const terminalSubmit = (e, allPackages) => {
    e.preventDefault();
    let tempArr = [...allPackages.content]
    tempArr.push(<p>{allPackages.path + allPackages.command}</p>);

    if (!SIGINT) {
        let commands = allPackages.command.split('&&')
        if (allPackages.command.length!==0) allPackages.os.updateHistory(allPackages.command)
        allPackages.os.idx = allPackages.os.histories.length
        commands.forEach((indivCommand) => {
            if (indivCommand === '')
                return
            let addition = CommandParser(indivCommand.trim(), allPackages)
            if (addition === 'clear')
                tempArr = clear_screen_text();
            else if (addition === 'exit'){
                allPackages.removeTab(0);
            }
            else
                tempArr = tempArr.concat(addition)
        }
        )
    }
    allPackages.setContent(tempArr)
    allPackages.setCommand('')
    SIGINT = false;
}

const Handle_allPackages = (allPackages) => {
    return useEffect(() => {
        if (allPackages.interval.current.id !== 0)
            clearInterval(allPackages.interval.current.id)
        if (!allPackages.inView)
            return
        allPackages.interval.current.id = setInterval(allPackages.interval.current.function, 1000);
        allPackages.inputRef.current.scrollIntoView();
    }, [allPackages])
}

const PackageStates = () => {
    const [os] = useState(new OS())
    const [command, setCommand] = useState('');
    const [path, setPath] = useState(os.terminalString);
    const [content, setContent] = useState(create_initial_text());
    const [file, setFile] = useState();
    const [editor, setEditor] = useState(false);
    return {
        os: os,
        command, setCommand,
        path, setPath,
        content, setContent,
        file, setFile,
        editor, setEditor
    }
}

const PackageRefs = (props) => {
    const inputRef = useRef(null);
    const interval = useRef({
        id: 0,
        function: () => {
            if (!props.inView && inputRef.current)
                return

            inputRef.current.focus();
        }
    })
    return {
        inputRef: inputRef,
        interval: interval
    }
}


const PackageAll = (props) => {
    const packagedStates = PackageStates();
    const packagedRefs = PackageRefs(props);
    let allPackages = {
        ...packagedStates,
        ...packagedRefs,
        ...props
    }
    return allPackages
}


const Terminal = (props) => {

    const allPackages = PackageAll(props);
    Handle_allPackages(allPackages);

    return (
        (allPackages.editor)?
        (<div>
                <TextEditor allPackages={allPackages}></TextEditor>
        </div>):
        (
        <div className={props.display + " main"}>    
            <div className={"css-typing "}>
                {
                    allPackages.content.map((item, key) => {
                        return <Fragment key={key}>{item}</Fragment>;
                    })
                }
            </div>
            <form style={{display:'flex'}} onSubmit={(e) => terminalSubmit(e, allPackages)}>
                <span style={{marginRight: 5}}>{allPackages.path + " "}</span>
                <input data-testid='terminalInput' type="text" autoFocus spellCheck="false" autoComplete="off" onKeyDown={(e) => handleSpecialKey(e, allPackages)} value={allPackages.command} onChange={(e) => updateTerminalLine(e, allPackages)} ref={allPackages.inputRef} />
                <p>⠀</p>
            </form>
        </div>
        )
    );
}
export default Terminal;