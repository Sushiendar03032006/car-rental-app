<h1>🚗 DriveNow – Car Rental and Booking Platform</h1>

<p>
DriveNow is a full-stack web application for car rental and booking with dynamic price prediction using mathematical and rule-based pricing.
The platform calculates rental cost based on multiple demand factors such as car type, fuel type, capacity, distance, and number of days.
</p>

<p>
It is built using the <b>MERN Stack</b>, styled with <b>Tailwind CSS</b>, and integrated with external services for distance calculation, email handling, and authentication.
</p>

<hr>

<h2>🌐 Live Demo</h2>

<p>
👉 <b>Deployed Link:</b><br>
<a href="https://your-vercel-link-here.vercel.app" target="_blank">
https://your-vercel-link-here.vercel.app
</a>
</p>

<p><i>📌 Replace the above link with your actual Vercel deployment URL.</i></p>

<hr>

<h2>📌 Features</h2>

<ul>
  <li>✅ User Authentication (Login / Signup / Forgot Password)</li>
  <li>✅ Car Search and Booking System</li>
  <li>✅ Dynamic Price Prediction System</li>
  <li>✅ Distance Calculation using Osmar AI</li>
  <li>✅ Subscription System</li>
  <li>✅ Email Notifications</li>
  <li>✅ Responsive UI with Tailwind CSS</li>
  <li>✅ Secure Password Reset</li>
  <li>✅ Admin & User Dashboard (if applicable)</li>
</ul>

<hr>

<h2>🧠 Dynamic Pricing System</h2>

<p>The rental price is calculated using Math-based and Rule-based Logic based on:</p>

<ul>
  <li>🚘 Car Type (SUV, Sedan, Hatchback, etc.)</li>
  <li>⛽ Fuel Type (Petrol, Diesel, Electric)</li>
  <li>👥 Seating Capacity</li>
  <li>📍 Distance (calculated using Osmar AI)</li>
  <li>📅 Number of Days</li>
  <li>📈 Demand Factor</li>
</ul>

<h3>📌 Pricing Formula (Example)</h3>

<pre>
Total Price =
(Base Price × Distance × Days)
+ Fuel Factor
+ Capacity Factor
+ Demand Factor
</pre>

<p>This ensures fair and flexible pricing depending on usage and demand.</p>

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
  <li>📍 Osmar AI – Distance Calculation</li>
  <li>📩 Brevo – Forgot Password & Email Services</li>
  <li>☁️ Vercel – Deployment</li>
</ul>

<hr>

<h2>📂 Project Structure</h2>

<pre>
DriveNow/
│
├── client/        → React Frontend
├── server/        → Node + Express Backend
├── models/        → MongoDB Schemas
├── routes/        → API Routes
├── controllers/   → Business Logic
├── utils/         → Pricing & Helper Functions
└── README.md
</pre>

<hr>

<h2>🖼️ Application Screenshots</h2>

<p>📌 Add screenshots of all pages in the folder below and link them here.</p>

<h3>📁 Folder Structure for Images</h3>

<pre>
screenshots/
├── home.png
├── login.png
├── signup.png
├── booking.png
├── pricing.png
├── dashboard.png
├── payment.png
</pre>

<h3>📸 UI Preview</h3>

<ul>
  <li>🏠 Home Page</li>
  <li>🔐 Login Page</li>
  <li>📝 Signup Page</li>
  <li>🚘 Car Booking Page</li>
  <li>💰 Price Calculation Page</li>
  <li>📊 Dashboard</li>
</ul>

<p><i>🔹 Replace image names if your filenames are different.</i></p>

<hr>

<h2>⚙️ Installation & Setup</h2>

<h3>1️⃣ Clone Repository</h3>

<pre>
git clone https://github.com/your-username/drivenow.git
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

<p>Create <b>.env</b> file inside server folder:</p>

<pre>
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
EMAIL_API_KEY=your_brevo_key
OSMAR_API_KEY=your_osmar_key
</pre>

<h3>4️⃣ Run the Project</h3>

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
  <li>🔒 Secure JWT-based Authentication</li>
  <li>📩 Password Reset using Brevo Email Service</li>
  <li>📬 Subscription Handling using EmailJS</li>
</ul>

<hr>

<h2>📩 Email & Subscription</h2>

<ul>
  <li>Forgot Password → Brevo</li>
  <li>Subscription Emails → EmailJS</li>
  <li>Booking Confirmation → Automated Mail</li>
</ul>

<hr>

<h2>🚀 Deployment</h2>

<p>The project is deployed using Vercel.</p>

<h3>Steps</h3>

<ol>
  <li>Connect GitHub Repository to Vercel</li>
  <li>Select Frontend Folder</li>
  <li>Configure Environment Variables</li>
  <li>Deploy</li>
</ol>

<p>Live URL is added in the Live Demo section above.</p>

<hr>

<h2>📈 Future Enhancements</h2>

<ul>
  <li>🤖 AI-based Demand Prediction</li>
  <li>📱 Mobile Application</li>
  <li>💳 Payment Gateway Integration</li>
  <li>📊 Advanced Analytics</li>
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

<p>This project is licensed under the <b>MIT License</b>.</p>
