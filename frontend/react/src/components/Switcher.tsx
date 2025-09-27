import { Switch } from "@/components/ui/switch"
import { Button } from "./ui/button";
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react";
import Graph from './graph'

interface NodeType{
	changeType: string,
	querySelector: string,
	replacementHTML: string,
	connections: number[],
	descriptionText: string
}


const Switcher = () => {
	const accessibility_type_lower = ["img_alt", "img_contrast",  "page_contrast",  "page_navigation",  "page_skip_to_main"]
	const [accesibilityArr, setAccesibilityArr] = useState<string[]>([])
	const [nodes, setNodes] = useState<NodeType[]>([]);
	const [dev, setDev] = useState<boolean>(false);
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

	useEffect(() => {
		//		setTimeout(() => {
		//			if(!dev) makeAccessible();
		//		}, 3000);
	}, [])

	const makeAccessible = async() => {
		const rawHtml = document.body.innerHTML;
		console.log(
			JSON.stringify({
				html: rawHtml,
				RequestedChecks: accesibilityArr 
			}))

		try {
			const response = await fetch('http://localhost:8000/debug', {
				method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				html: rawHtml,
				requested_checks: accesibilityArr 
			})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setNodes(data.connections); 
		} catch (error) {
			console.error('Fetch failed:', error);
			
		}
	}

	useEffect(() => {
		console.log(accesibilityArr)
	}, [accesibilityArr])


	return (

		<>
		<Switch checked={dev} onCheckedChange={setDev} />
		<Label> {dev ? 'Dev' : 'User'} </Label>
		<div className="flex flex-col justify-center items-center text-center h-screen w-screen">
		{dev && accessibility_type_lower.map((atl, i) => (
			<div className="flex items-baseline space-x-2" key={i.toString()}>
			<Switch id="type-switch" checked={accesibilityArr.includes(atl)} onCheckedChange={(checked) => handleToggle(atl, checked)} />
			<Label htmlFor="type-switch">{translate(atl)}</Label>
			</div>
		))}
		<Button className="m-8" onClick={makeAccessible}> Make Accessible </Button>

		<Graph nodes={nodes} />

		</div>

		{nodes.length > 0 && <Graph nodes={nodes} />}
		</>

	)
}

export default Switcher
