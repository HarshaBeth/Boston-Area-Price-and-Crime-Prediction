import React from "react";

function Evaluation() {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      {/* Left and Right */}

      <div className="flex flex-row h-full w-full">
        {/* Left Content */}
        <div className="w-[50%] flex flex-col justify-center items-center">
          <div className="flex flex-col space-y-4">
            <div>
              <p className="text-gray-400">Boston &gt; Washington St</p>
              <h1 className="font-bold text-4xl italic">Residence Overview</h1>
            </div>
            <div>
              <p>Washington St Crime Rate: 5.2 %</p>
              <p>Average Price: $1,200,000</p>
              <p>Common crime(s): Theft</p>
              <p>Nearby Transport: Bus, Subway</p>
            </div>
          </div>
        </div>

        {/* Right: Map */}
        <div className="w-[50%]">
          <iframe
            className="w-full h-full"
            title="Charles River Map"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5897.01927819441!2d-71.123218!3d42.356045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e3773e5e6f7e2d%3A0x7e8b7e2b7e2b7e2b!2sCharles%20River!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Evaluation;
