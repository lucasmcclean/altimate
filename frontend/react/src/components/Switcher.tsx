import { Switch } from "@/components/ui/switch"
import nodesTemp from "./tempData";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react";
import Graph from './graph'

interface NodeType{
	changeType: string,
	querySelector: string,
	replacementHTML: string,
	connections: number[],
	descriptionText: string
}

type ChangeType = 
  | "img_alt_added"
  | "img_alt_altered"
  | "img_contrast_altered"
  | "page_contrast_altered"
  | "page_navigation_altered"
  | "page_skip_to_main_added";


interface NodeData {
  id: string;
  changeType: ChangeType;
  descriptionText: string;
  querySelector: string;
  connections: string[];
  size: number;
  color: string;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

const Switcher = () => {
	const accessibility_type_lower = ["img_alt", "img_contrast",  "page_contrast",  "page_navigation",  "page_skip_to_main"]
	const [accesibilityArr, setAccesibilityArr] = useState<string[]>([])
	const [nodes, setNodes] = useState<NodeType[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [dev, setDev] = useState<boolean>(false);
  const [showDevOptions, setShowDevOptions] = useState<boolean>(false); // New state for controlling rendering
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // States for Switcher bar animation
  const [showSwitcherBar, setShowSwitcherBar] = useState(true);
  const [slideInSwitcherBar, setSlideInSwitcherBar] = useState(true);

  // Load accessibility options from chrome.storage on component mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['accesibilityArr'], (result) => {
        if (result.accesibilityArr) {
          setAccesibilityArr(result.accesibilityArr);
        }
      });
    }
  }, []);

  // Save accessibility options to chrome.storage whenever they change
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ accesibilityArr });
    }
  }, [accesibilityArr]);

  // Effect to manage the rendering of developer options with a delay for transition
  useEffect(() => {
    if (dev) {
      setShowDevOptions(true);
    } else {
      const timeoutId = setTimeout(() => setShowDevOptions(false), 300); // 300ms matches transition duration
      return () => clearTimeout(timeoutId);
    }
  }, [dev]);

  // Effect to manage the Switcher bar animation based on selectedNode
  useEffect(() => {
    if (selectedNode) {
      setSlideInSwitcherBar(false); // Start sliding out
      const hideTimeout = setTimeout(() => setShowSwitcherBar(false), 300); // Hide after animation
      return () => clearTimeout(hideTimeout);
    } else {
      setShowSwitcherBar(true);
      // Allow a very short moment for the component to render with initial state before sliding in
      const slideInTimeout = setTimeout(() => setSlideInSwitcherBar(true), 10);
      return () => clearTimeout(slideInTimeout);
    }
  }, [selectedNode]);

	const translate  = (untranslatedText: string) => {
		if(untranslatedText == "img_alt"){
			return "Alternative Image"
		}
		else if(untranslatedText == "img_contrast"){
			return "Image Contrast"
		}
		else if(untranslatedText == "page_contrast"){
			return "Page Contrast"
		}
		else if(untranslatedText == "page_navigation"){
			return "Page Navigation"
		}
		else{
			return "Skip to Main"
		}
	}

	const handleToggle = (id: string, checked: boolean) => {
		setAccesibilityArr((prev) =>
											 checked ? [...prev, id] : prev.filter((item) => item !== id)
											)
	}

	

	const makeAccessible = async() => {
    setError(null); // Clear previous errors
    setIsLoading(true);
    const rawHtml = document.body.innerHTML;
    fetch('http://localhost:8000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: rawHtml,
        requested_checks: accesibilityArr
      })
    })
    .then(response => response.json())
    .then(data => {
      setIsLoading(false);
      setNodes(data.connections);
    })
	}


	return (
		<div className="w-screen flex items-center justify-around min-h-screen bg-white dark:bg-gray-900">
		{showSwitcherBar && 
			<div className={`w-[42%] flex flex-col h-screen transition-transform duration-300 ease-out ${slideInSwitcherBar ? 'translate-x-0' : '-translate-x-full'}`}> 
		<h1 className="my-4 w-full flex justify-center items-center"> AltiMate </h1>
		<Separator />
		<div className="w-full self-center mt-20 max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
		<div className="flex flex-col items-start justify-between mb-6">
		<p className="text-4xl text-gray-900 dark:text-gray-100">Accessibility Options</p>
		<div className="flex items-center space-x-2 mt-4">
		<Label htmlFor="dev-mode" className="font-bold text-md">{dev ? 'Developer' : 'User'}</Label>
		<Switch id="dev-mode" checked={dev} onCheckedChange={setDev} />
		</div>
		</div>

		<div
			className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
				dev ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
			}`}
		>
			<div className="overflow-hidden space-y-4">
			{showDevOptions && accessibility_type_lower.map((atl) => (
				<div className="flex items-center justify-between" key={atl}>
				<Label htmlFor={atl} className="text-gray-800 dark:text-gray-200">
				{translate(atl)}
				</Label>
				<Switch
				id={atl}
				checked={accesibilityArr.includes(atl)}
				onCheckedChange={(checked) => handleToggle(atl, checked)}
				/>
				</div>
			))}
			</div>
		</div>

    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

		<Button className="w-full mt-6 btn-gradient-hover" onClick={makeAccessible} disabled={isLoading}>
		{isLoading ? 'Loading...' : 'Make Accessible ✦'}
		</Button>
		</div>
			</div>}

			{nodes.length > 0 && (
				<div className="w-full max-w-4xl">
					<Graph selectedNode={selectedNode} setSelectedNode={setSelectedNode} nodes={nodes} />
				</div>
			)}
			{nodes.length == 0 && (
				<div className="w-full max-w-4xl">
					<Graph selectedNode={selectedNode} setSelectedNode={setSelectedNode} nodes={nodesTemp} />
				</div>
			)
			}
		</div>
	);
}

export default Switcher
