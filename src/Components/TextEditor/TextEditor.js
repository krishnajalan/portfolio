import React, {useState} from 'react'
import './TextEditor.css'

const TextEditor = ({allPackages}) =>{

    const [text, setText] = useState(allPackages.file.contents);
    const [time, setTime] = useState(new Date());
    const handleChange = (event) => {
        setText(event.target.value);
    }

    const handleSpecialKey = (event,  allPackages) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        
        if (event.key === 'Tab') {
            event.preventDefault();
            setText(event.target.value + '\t');
        }
        else if (event.ctrlKey && charCode === 'q') {
            allPackages.setEditor(false);
        }
        else if (event.ctrlKey && charCode === 's'){
            event.preventDefault();
            allPackages.file.contents = text;
            allPackages.os.saveState();
            setTime(new Date())
        }
    }
    
    return(
        <div className='main text_editor'>
            
            <textarea
                autoFocus
                className='editor_area'
                ref = {allPackages.inputRef}
                type='text' 
                value={text}
                onKeyDown={(event)=>handleSpecialKey(event, allPackages)}
                onChange={(event)=>handleChange(event)}
            />
            <div className='editor'>
                <b>Ctrl+q: exit the file</b>
                <b>Ctrl+s: save the file</b>
                <b>Last Saved:{time.toLocaleTimeString("en-US")}</b>
            </div>
        </div>
    )
}

export default TextEditor;