import Switcher from './components/Switcher'
import { useTheme } from './lib/ThemeContext'
import { Sun, Moon } from 'lucide-react';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <button
        onClick={toggleTheme}
        className="z-1 absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300"
      >
        {theme === 'dark' ? <Sun className="h-6 w-6 text-black dark:text-white" /> : <Moon className="h-6 w-6 text-black dark:text-white" />}
      </button>
      <Switcher />
    </div>
  )
}

export default App
