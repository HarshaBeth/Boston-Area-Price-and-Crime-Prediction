"use client";

import { Progress } from "@radix-ui/react-progress";
import { useEffect, useState } from "react";

type ProgressBarProps = {
  progress_value: number;
  total: number;
};

function ProgressBar({ progress_value, total }: ProgressBarProps) {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const newPercentage = (progress_value / total) * 100;
    setPercentage(newPercentage);
  }, [progress_value, total]);

  return (
    <div>
      <Progress
        value={percentage}
        max={100}
        style={{ width: "100%", height: "5px", background: "#eee" }}
        className="rounded-full overflow-hidden"
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "green",
          }}
        />
      </Progress>
    </div>
  );
}

export default ProgressBar;
