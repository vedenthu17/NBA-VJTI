import { useState, useEffect } from "react";
import vjtiLogoEnglish from "../assets/vjti-logo-english.png";
import vjtiLogoMarathi from "../assets/vjti-logo-marathi.png";

export default function RotatingLogo() {
  const [currentLogo, setCurrentLogo] = useState(0);
  const logos = [vjtiLogoEnglish, vjtiLogoMarathi];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
  <div className="-ml-4 flex justify-start">
    <img
      src={logos[currentLogo]}
      alt="VJTI"
      className="h-20 w-auto transition-opacity duration-500"
    />
  </div>
);
}
