import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/themeContext";

export default function ThemeToggle() {

  const { isDark, setIsDark } = useTheme();

  return (
    <Button 
      className="cursor-pointer text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors" 
      variant="ghost" 
      size="icon" 
      aria-label="toggle theme" 
      onClick={() => setIsDark(!isDark)}
    >
      {isDark ? <SunIcon className="h-5 w-5 text-amber-400" /> : <MoonIcon className="h-5 w-5 text-slate-700" />}
    </Button>
  );
}