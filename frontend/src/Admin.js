// Admin.js

import {useEffect,useState} from "react";
import axios from "axios";

// const API = "https://YOUR-RENDER-URL.onrender.com";
const API = "https://wedding-rsvp-app-0n5a.onrender.com";

function Admin(){

const [responses,setResponses] = useState([]);
const [stats,setStats] = useState({});

const token = localStorage.getItem("token");

const headers = {
Authorization:`Bearer ${token}`
};

const fetchResponses = async()=>{

const res = await axios.get(`${API}/responses`,{headers});

setResponses(res.data);

};

const fetchStats = async()=>{

const res = await axios.get(`${API}/stats`,{headers});

setStats(res.data);

};

const deleteGuest = async(id)=>{

await axios.delete(`${API}/guest/${id}`,{headers});

fetchResponses();

};

useEffect(()=>{

fetchResponses();
fetchStats();

},[]);

return(

<div style={{padding:"40px"}}>

<h1>Admin Dashboard</h1>

<h2>Total RSVP: {stats.total_rsvp}</h2>

<table border="1">

<thead>

<tr>
<th>Name</th>
<th>Phone</th>
<th>Guests</th>
<th>Message</th>
<th>Action</th>
</tr>

</thead>

<tbody>

{responses.map((r)=>(

<tr key={r.id}>

<td>{r.name}</td>
<td>{r.phone}</td>
<td>{r.guest_count}</td>
<td>{r.message}</td>

<td>

<button onClick={()=>deleteGuest(r.id)}>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

);

}

export default Admin;