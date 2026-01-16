import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/themeContext";

export default function ThemeToggle() {

  const { isDark, setIsDark } = useTheme();

  return (
    <Button className="cursor-pointer text-white bg-no" variant="ghost" size="icon" aria-label="toggle theme" onClick={() => setIsDark(!isDark)}>
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </Button>
  );
}