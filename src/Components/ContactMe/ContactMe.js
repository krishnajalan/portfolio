import React from 'react';
import './ContactMe.css';
import '../../Containers/Terminal/Terminal.css'
import emailjs from 'emailjs-com';

const ContactMe = () =>{
    return(
    <div className = "main">
        <form onSubmit={submit}className="contactForm">
            <h3>Contact Me</h3>
            <p>If you have a question or simply want to say hello.</p>
            <input data-testid='email' className="input" id="email" type="email" placeholder="Your Email"></input>
            <input data-testid='subject' className="input" id="subject" type="text" placeholder="What You Want to Talk About"></input>
            <textarea data-testid='text-box' id="content"></textarea>
            <input data-testid='submitButton' type="submit" className="Submit" value="Submit"></input>
        </form>
    </div>
    );
}

const submit = (e) =>{
    e.preventDefault();
    let email = document.getElementById("email").value;
    let subject = document.getElementById("subject").value;
    let message = document.getElementById("content").value;

    let templateParams = {
        from_name: email,
        to_name: 'krishnajalan2001@gmail.com',
        subject: subject,
        message: message,
       }

    if(email !== "" && subject !== "" && message !== ""){
        emailjs.send('service_6svt8bj', 'template_5clc5l4', templateParams, 'user_RIryPVtBjOSoGb1bFYbCN')
        .then((result) => {
            alert("Email Sent Succesfully")
            document.getElementById("email").value = "";
            document.getElementById("subject").value = "";
            document.getElementById("content").value = "";
        }, (error) => {
            alert("Email Not Sent");
            console.log(error.text);
        });
    }
    else{
        alert("Please fill in all Fields");
    }


}

export default ContactMe;