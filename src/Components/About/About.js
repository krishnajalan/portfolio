import React from 'react';
import './About.css';
import '../../Containers/Terminal/Terminal.css'

const About = () =>{
    return(
    <section className = "main section">
        <div className="about">
            <div className="text">
                <div  className="header">
                    <h1>About Me</h1>
                </div>
                <p>Hello! I'm Krishna, an aspiring Computer Science Engineer<br/>⠀</p>
                <p>Currently I'm a third year student at <a className="school"href="https://jklu.edu.in/" target="_blank" rel="noreferrer">JK Lakshmipat University</a>. 
                    I'm a dog lover and like Competitive Coding and Video Games (add me on <a className="school"href="https://steamcommunity.com/profiles/76561198376048763/" target="_blank" rel="noreferrer">Steam</a> or 
                    <a className="school"href="https://discordapp.com/users/299213605377802258/" target="_blank" rel="noreferrer">Discord</a> for gaming session.
                    ).
                <br/>⠀
                </p>
                <p>Here are a few technologies I've worked with recently:<br/>⠀</p>
                {getTechnologies()}
            </div>
            <div className="avatar"></div>
        </div>
    </section>
    );
}

const getTechnologies = () =>{
    return <ol className="technologies">
                <li>Python</li>
                <li>Django</li>
                <li>FastApi</li>
                <li>Node.js</li>
                <li>C/C++</li>
                <li>PostgreSQL</li>
                <li>SQLite</li>
                <li>Kernel Programming</li>
                <li>Nginx</li>
                <li>Docker</li>
            </ol>
}
export default About;