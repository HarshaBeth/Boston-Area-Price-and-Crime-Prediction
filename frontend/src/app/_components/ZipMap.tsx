"use client";

import dynamic from "next/dynamic";

type ZipMapProps = {
  selectedZip: string | null;
};

// Dynamically import the inner map component on the client only
const ZipMapInner = dynamic(() => import("./ZipMapInner"), {
  ssr: false,
});

export default function ZipMap(props: ZipMapProps) {
  return <ZipMapInner {...props} />;
}
