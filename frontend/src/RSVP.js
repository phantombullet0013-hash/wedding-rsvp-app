// RSVP.js

import {useState} from "react";
import axios from "axios";

// const API = "https://YOUR-RENDER-URL.onrender.com";
const API = "https://wedding-rsvp-app-0n5a.onrender.com";

function RSVP(){

const [name,setName] = useState("");
const [phone,setPhone] = useState("");
const [guest_count,setGuest] = useState(1);
const [message,setMessage] = useState("");

const submitForm = async(e)=>{

e.preventDefault();

try{

await axios.post(`${API}/rsvp`,{
name,
phone,
guest_count:Number(guest_count),
message
});

alert("RSVP submitted!");

setName("");
setPhone("");
setGuest(1);
setMessage("");

}catch(err){

alert("Failed");

}

};

return(

<div style={{textAlign:"center",marginTop:"50px"}}>

<h1>Ali & Aisyah Wedding</h1>

<form onSubmit={submitForm}>

<input
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
required
/>

<br/><br/>

<input
placeholder="Phone"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
required
/>

<br/><br/>

<input
type="number"
value={guest_count}
onChange={(e)=>setGuest(e.target.value)}
min="1"
/>

<br/><br/>

<textarea
placeholder="Message"
value={message}
onChange={(e)=>setMessage(e.target.value)}
/>

<br/><br/>

<button type="submit">
Submit
</button>

</form>

</div>

);

}

export default RSVP;