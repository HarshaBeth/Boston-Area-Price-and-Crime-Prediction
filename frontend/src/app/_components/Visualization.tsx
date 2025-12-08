import React from "react";
import Image from "next/image";
import GithubIcon from "../../../public/icons8-github.svg";
import Link from "next/link";
import AvgVal from '../../../public/average_value_zipcode.png';
import ModelEval from '../../../public/model_eval.png';

export default function Visualization() {
  return (
    <div className="h-screen w-full bg-black text-white" id="visualization">
      
      <div className="flex flex-col h-full w-full justify-center">
      <div className="py-4 flex items-center justify-center space-x-4">
        <Image src={AvgVal} alt="Average Total Value by ZIP Code in Boston" width={800} height={400} />
        <Image src={ModelEval} alt="Random Forest Model Evaluation" width={500} height={400} />
      </div>
      <div className="">
      <hr className="my-2 border-t border-gray-700 " />
      <div className=" flex items-center justify-center">
        <footer className=" text-gray-500 text-md flex justify-between items-center w-full max-w-7xl">
          <div className="">
            &copy; {new Date().getFullYear()} Boston Area Price Prediction
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
      </div>
    </div>
  );
}
