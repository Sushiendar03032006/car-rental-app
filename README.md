<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DriveNow - Car Rental Platform</title>
</head>
<body>

<h1>🚗 DriveNow – Car Rental and Booking Platform</h1>

<p>
DriveNow is a full-stack web application for car rental and booking with dynamic price prediction using mathematical and rule-based pricing.
</p>

<p>
The platform calculates rental cost based on multiple demand factors such as car type, fuel type, capacity, distance, and number of days.
</p>

<p>
Built using MERN Stack, Tailwind CSS, and integrated with external services.
</p>

<hr>

<h2>🌐 Live Demo</h2>

<p>
👉 <b>Deployed Link:</b><br>
https://drivenow-rose.vercel.app/
</p>



<hr>

<h2>📌 Features</h2>

<ul>
  <li>✅ User Authentication (Login / Signup / Forgot Password)</li>
  <li>✅ Car Search and Booking System</li>
  <li>✅ Dynamic Price Prediction</li>
  <li>✅ Distance Calculation</li>
  <li>✅ Subscription System</li>
  <li>✅ Email Notifications</li>
  <li>✅ Responsive UI</li>
  <li>✅ Secure Password Reset</li>
  <li>✅ Admin & User Dashboard</li>
  <li>✅ Role Based Access Control</li>
</ul>

<hr>

<h2>🧠 Dynamic Pricing System</h2>
<p>
The Dynamic Price Prediction System calculates rental charges using mathematical formulas,
rule-based logic, and real-time distance APIs to ensure fair and profit-optimized pricing.
</p>

<h3>📌 Ride Classification</h3>

<table border="1" cellpadding="8">
  <tr>
    <th>Type</th>
    <th>Conditions</th>
  </tr>
  <tr>
    <td>Intracity</td>
    <td>≤ 30 km, 1 Day</td>
  </tr>
  <tr>
    <td>Express</td>
    <td>≤ 60 km, 1 Day</td>
  </tr>
  <tr>
    <td>Intercity</td>
    <td>> 60 km / Multiple Days</td>
  </tr>
</table>





<p>Price is calculated based on:</p>

<ul>
  <li>🚘 Car Type</li>
  <li>⛽ Fuel Type</li>
  <li>👥 Seating Capacity</li>
  <li>📍 Distance calculated using OSRM tool</li>
  <li>📅 Number of Days</li>
  <li>📈 Demand Factor</li>
</ul>

<h3>📐 Pricing Formula</h3>

<pre>
Total Price =
(Base Price × Distance × Days)
+ Fuel Factor
+ Capacity Factor
+ Demand Factor
</pre>

<hr>

<h2>🛠️ Tech Stack</h2>

<h3>Frontend</h3>
<ul>
  <li>⚛️ React.js</li>
  <li>🎨 Tailwind CSS</li>
  <li>📧 EmailJS</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>🟢 Node.js</li>
  <li>🚂 Express.js</li>
  <li>🍃 MongoDB</li>
</ul>

<h3>APIs & Services</h3>
<ul>
  <li>📍 Osrm tool </li>
  <li>📩 Brevo</li>
  <li>☁️ Vercel</li>
</ul>

<hr>





<h2>🖼️ Application Screenshots</h2>



<h3>📁 Folder Structure</h3>

<img width="368" height="842" alt="image" src="https://github.com/user-attachments/assets/2ab67bd0-c669-47eb-8513-9bdb4175355d" />
>

<h3>📸 UI Preview</h3>

<ul>
  <li>🏠 Home Page</li>
  <img width="1918" height="865" alt="image" src="https://github.com/user-attachments/assets/9c5161bf-348e-414e-9503-cc117b74f781" />
  <img width="1881" height="775" alt="image" src="https://github.com/user-attachments/assets/aaa2196b-a656-42fd-8607-2193a87b4074" />
  <img width="1896" height="792" alt="image" src="https://github.com/user-attachments/assets/da5de78e-8413-471c-80ac-caf6bfd2f7d0" />
  <img width="1897" height="782" alt="image" src="https://github.com/user-attachments/assets/6caf31f5-58a0-4709-ae93-5c26d02f0f03" />




  <li>🔐 Login AND SignUp Page</li>
  <img width="583" height="535" alt="image" src="https://github.com/user-attachments/assets/cfe29c87-bd7e-49f0-af39-72e7e1765053" />
  <img width="555" height="636" alt="image" src="https://github.com/user-attachments/assets/fbd6dc4f-4eef-4bc8-b6fe-b8da8a8a1b4c" />


 
  <li>🚘 Booking Page</li>
  <img width="1872" height="792" alt="image" src="https://github.com/user-attachments/assets/94a39be7-0df4-487a-8eb6-b2c73c11c77b" />
  <img width="1893" height="862" alt="image" src="https://github.com/user-attachments/assets/d7c91c4e-1554-47d7-aacf-4cbd2e966000" />
  <img width="1460" height="763" alt="image" src="https://github.com/user-attachments/assets/5bd31cff-6019-42c1-918e-9314a9dc1e9b" />


  
  <li>📊 Dashboard</li>
  <img width="1596" height="676" alt="image" src="https://github.com/user-attachments/assets/361c0490-ec79-4f07-aabe-f1af00ecf805" />
  <img width="1883" height="865" alt="image" src="https://github.com/user-attachments/assets/e614a1fb-10fb-4669-acc1-a17768d440b4" />
  <img width="1918" height="747" alt="image" src="https://github.com/user-attachments/assets/09adcde4-e59f-4a01-b4b2-485ae34d5fde" />
  <img width="1865" height="553" alt="image" src="https://github.com/user-attachments/assets/8aea6f27-ac20-4a6b-854b-beb3e310bd92" />




  
</ul>

<hr>

<h2>⚙️ Installation & Setup</h2>

<h3>1️⃣ Clone Repository</h3>

<pre>
git clone https://github.com/Sushiendar03032006/car-rental-app.git
</pre>

<h3>2️⃣ Install Dependencies</h3>

<h4>Frontend</h4>
<pre>
cd client
npm install
</pre>

<h4>Backend</h4>
<pre>
cd server
npm install
</pre>

<h3>3️⃣ Environment Variables</h3>

<p>Create <b>.env</b> in server folder:</p>

<pre>
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
EMAIL_API_KEY=your_brevo_key

</pre>

<h3>4️⃣ Run Project</h3>

<h4>Backend</h4>
<pre>
npm start
</pre>

<h4>Frontend</h4>
<pre>
npm run dev
</pre>

<hr>

<h2>🔐 Authentication System</h2>

<ul>
  <li>JWT Authentication</li>
  <li>Password Reset using Brevo</li>
  <li>Email Verification</li>
</ul>

<hr>

<h2>📩 Email & Subscription</h2>

<ul>
  <li>Forgot Password → Brevo</li>
  <li>Subscription → EmailJS</li>
  <li>Booking Confirmation → Email</li>
</ul>

<hr>

<h2>🚀 Deployment</h2>

<ol>
  <li>Connect GitHub to Vercel</li>
  <li>Select Frontend Folder</li>
  <li>Add Environment Variables</li>
  <li>Deploy</li>
</ol>

<hr>

<h2>📈 Future Enhancements</h2>

<ul>
  <li>🤖 AI Demand Prediction</li>
  <li>📱 Mobile App</li>
  <li>💳 Payment Gateway</li>
  <li>📊 Analytics</li>
  <li>🌍 Multi-city Support</li>
</ul>

<hr>


<h2>👨‍💻 Author</h2>

<p>
<b>M Sushiendar</b><br>
BE Computer Science and Engineering<br>
Saveetha Engineering College
</p>

<hr>

<h2>📜 License</h2>

<p>This project is licensed under the MIT License.</p>

</body>
</html>
