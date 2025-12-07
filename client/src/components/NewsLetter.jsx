import React, { useState } from "react";
import toast from "react-hot-toast";
import emailjs from '@emailjs/browser'; 

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) return;

    setIsLoading(true);

    // ---------------------------------------------------------
    // 📧 EMAILJS CONFIGURATION
    // ---------------------------------------------------------
    
    // ⚠️ FIX: Wrap these values in quotes!
    const serviceID = "service_8ibd4nr";   
    const templateID = "template_5f1q54x"; 
    const publicKey = "wdH54UezKDLAk2ayW";  

    // The data variables you want to send to your email template
    const templateParams = {
      user_email: email, // Matches {{user_email}} in your EmailJS template
      message: "New Newsletter Subscriber!",
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        toast.success(`Subscribed! Confirmation sent to ${email}`);
        setEmail("");
      })
      .catch((err) => {
        console.error('FAILED...', err);
        toast.error("Subscription failed. Please check console for details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-3xl mx-auto my-14 px-4">
      <h1 className="md:text-4xl text-2xl font-semibold text-gray-800">
        Never Miss a Deal!
      </h1>
      <p className="md:text-lg text-gray-500 pb-6 max-w-lg">
        Subscribe to get the latest offers, new arrivals, and exclusive discounts.
      </p>

      <form
        onSubmit={handleSubscribe}
        className="flex w-full max-w-xl h-12 md:h-14 relative shadow-sm"
      >
        <input
          type="email"
          name="user_email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          disabled={isLoading}
          className="flex-1 border border-gray-300 rounded-l-lg px-4 text-gray-700 outline-none focus:border-blue-500 transition-all disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-8 md:px-10 font-medium rounded-r-lg transition-all text-white
            ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isLoading ? "Sending..." : "Subscribe"}
        </button>
      </form>
      
      <p className="text-xs text-gray-400 mt-3">
        We respect your privacy.
      </p>
    </div>
  );
};

export default Newsletter;