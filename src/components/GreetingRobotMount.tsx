"use client";

import dynamic from "next/dynamic";

const GreetingRobot = dynamic(() => import("./GreetingRobot"), {
  ssr: false,
  loading: () => <div className="h-36 w-32 sm:h-40 sm:w-36" aria-hidden />,
});

export default function GreetingRobotMount() {
  return <GreetingRobot />;
}
