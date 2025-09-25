import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <div className="bg-black h-20 w-full flex items-center justify-center">
      <div className="max-w-7xl w-full flex items-center justify-center">
        <div className="text-white font-bold space-x-10 flex items-center">
          <Link href={""} className="hover:text-green-500 transition">
            Author
          </Link>
          <Link
            href={"#visualization"}
            className="hover:text-green-500 transition"
          >
            Visualizations
          </Link>
          <Link href={""} className="hover:text-green-500 transition">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
