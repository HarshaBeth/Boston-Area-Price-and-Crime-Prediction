"use client";
import { useEffect, useState } from "react";
import Evaluation from "./Evaluation";
import Landing from "./Landing";
import Visualization from "./Visualization";

export default function HomePage() {
  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    console.log("Location updated:", location);
  }, [location]);
  return (
    <div>
      <Landing location={location} setLocation={setLocation} />
      <Evaluation location={location} />
      <Visualization />
    </div>
  );
}
