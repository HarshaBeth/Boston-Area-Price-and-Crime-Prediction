"use client";
import React, { useState } from "react";
import ProgressBar from "../components/ProgressBar";
import Location from "../../../public/location.png";
import Image from "next/image";
import ZipMap from "./ZipMap";

type EvaluationProps = {
  location?: string;
  predPrice?: number | null;
};

function Evaluation({ location, predPrice }: EvaluationProps) {

  const [price, setPrice] = useState(120000);

    const normalizedZip =
    location && location.trim() !== ""
      ? location.trim().padStart(5, "0")
      : null;

  const hasLocation = Boolean(normalizedZip);
  return (
    <div className={`flex justify-center items-center h-screen w-full`} id="residence_overview">
      {hasLocation ? (
        <div className="flex flex-row h-full w-full">
          {/* Left Content */}
          <div className="w-[50%] flex flex-col justify-center items-center">
            <div className="flex flex-col space-y-4">
              <div>
                <p className="text-gray-400">Boston &gt; {normalizedZip}</p>
                <h1 className="font-bold text-4xl italic">
                  Residence Overview
                </h1>
              </div>
              <div className="space-y-2">

                <div>
                  <p>Estimated Price: ${predPrice ? predPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  {/* <ProgressBar progress_value={price} total={200000} /> */}
                </div>
                {/* <p>Common crime(s): Theft</p>
                <p>Nearby Transport: Bus, Subway</p> */}
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div className="w-[50%] h-full">
            <ZipMap selectedZip={normalizedZip} />
          </div>
        </div>
      ) : (
        // Locked STATE, when no location is selected
        <div className="flex flex-row h-full w-full cursor-not-allowed relative">
          <div className="absolute z-20 gap-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
            <Image
              src={Location}
              alt="Location Icon"
              height={150}
              width={150}
            />
            <span className="font-bold text-black text-5xl mt-4 text-center font-serif">
              Select Location for Evaluation...
            </span>
          </div>

          <div className="opacity-25 flex flex-row h-full w-full">
            {/* Left Content */}
            <div className="w-[50%] flex flex-col justify-center items-center">
              <div className="flex flex-col space-y-4">
                <div>
                  <p className="text-gray-400">Boston &gt; ---</p>
                  <h1 className="font-bold text-4xl italic">
                    Residence Overview
                  </h1>
                </div>
                <div className="space-y-2">

                  <div>
                    <p>Average Price: ${price.toLocaleString()}</p>
                    <ProgressBar progress_value={price} total={200000} />
                  </div>
                  <p>Common crime(s): Theft</p>
                  <p>Nearby Transport: Bus, Subway</p>
                </div>
              </div>
            </div>

            {/* Right: Map */}
            <div className="w-[50%] pointer-events-none h-full">
              <ZipMap selectedZip={null} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Evaluation;
