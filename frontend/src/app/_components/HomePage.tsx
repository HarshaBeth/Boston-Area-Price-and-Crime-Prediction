"use client";
import { useEffect, useState } from "react";
import Evaluation from "./Evaluation";
import Landing from "./Landing";
import Visualization from "./Visualization";
import PriceForm from "./PriceForm";

export default function HomePage() {
  const [location, setLocation] = useState<string>("");
  const [predPrice, setPredPrice] = useState<number | null>(null);

  useEffect(() => {
    console.log("Location updated:", location);
  }, [location]);
  return (
    <div>
      {/* <Landing location={location} setLocation={setLocation} /> */}
      <PriceForm location={location} setLocation={setLocation} setPredPrice={setPredPrice} />
      <Evaluation location={location} predPrice={predPrice} />
      <Visualization />
    </div>
  );
}
