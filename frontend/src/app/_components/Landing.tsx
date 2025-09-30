import React, { useState } from "react";
import Image from "next/image";
import LandingImage from "../../../public/background_housing2.jpg";
import SearchIcon from "../../../public/search.png";

type LandingProps = {
  location?: string;
  setLocation: (location: string) => void;
};

function Landing({ location, setLocation }: LandingProps) {
  return (
    <div className="relative h-screen w-full">
      <Image
        src={LandingImage}
        alt="Landing"
        fill
        style={{ objectFit: "cover" }}
        className="absolute inset-0 z-0"
        priority
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="flex flex-col space-y-10">
          <h1 className="text-white text-8xl font-bold w-72">
            Boston&apos;s Residence Finder
          </h1>

          {/* Search bar */}
          <div className="flex justify-between items-center relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location or district code..."
              className="w-[500px] bg-white rounded-full h-14 px-6 text-lg focus:outline-none focus:shadow-inner focus:shadow-outline"
            />

            <button className="text-gray-400 absolute right-6 hover:cursor-pointer">
              <Image
                src={SearchIcon}
                alt="Search"
                height={25}
                width={25}
                className="rotate-y-180"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
