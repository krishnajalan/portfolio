import React, { useState, Fragment, useEffect, useRef } from 'react';
import './Terminal.css'
import OS from './OS'
import CommandParser from './CommandParser'
import starter_command_descriptions from '../../Resources/constants/starter_command_descriptions.json'
import { isMobile } from 'react-device-detect'

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
            <h4>This is a Fully Interactive Portfolio Page with a Linux Insprired Terminal (better on PC) <br /></h4>,
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
        if (allPackages.command.length!==0) allPackages.os.histories.push(allPackages.command)
        allPackages.os.idx = allPackages.os.histories.length
        commands.forEach((indivCommand) => {
            if (indivCommand === '')
                return
            let addition = CommandParser(indivCommand.trim(), allPackages)
            if (addition === 'clear')
                tempArr = clear_screen_text();
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
    return {
        os: os,
        command, setCommand,
        path, setPath,
        content, setContent
    }
}

const PackageRefs = (props) => {
    const inputRef = useRef(null);
    const blink = useRef(false)
    const interval = useRef({
        id: 0,
        function: () => {
            if (!props.inView && inputRef.current && blink.current !== null)
                return

            inputRef.current.focus();

            if (blink.current)
                inputRef.current.value = inputRef.current.value.replaceAll('▮', '');

            blink.current = !blink.current


        }
    })
    return {
        inputRef: inputRef,
        blink: blink,
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
    );
}
export default Terminal;