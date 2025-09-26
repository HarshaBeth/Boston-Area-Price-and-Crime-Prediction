import React from "react";
import Image from "next/image";
import GithubIcon from "../../../public/icons8-github.svg";
import Link from "next/link";

export default function Visualization() {
  return (
    <div className="h-screen w-full bg-black text-white" id="visualization">
      Some Visualizations will go here
      <hr className="my-2 border-t border-gray-700 " />
      <div className=" flex items-center justify-center">
        <footer className=" text-gray-500 text-md flex justify-between items-center w-full max-w-7xl">
          <div className="">
            &copy; {new Date().getFullYear()} Boston Area Price and Crime
            Prediction
          </div>

          <Link
            href={
              "https://github.com/HarshaBeth/Boston-Area-Price-and-Crime-Prediction"
            }
            target="_blank"
            className="hover:opacity-80 transition"
          >
            <Image src={GithubIcon} alt="Github" />
          </Link>
        </footer>
      </div>
    </div>
  );
}
