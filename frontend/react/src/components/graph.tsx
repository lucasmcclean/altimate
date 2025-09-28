import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lightbulb, Settings, Search } from 'lucide-react';
import * as d3 from 'd3';

import { useTheme } from '../lib/ThemeContext';

// Type definitions
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
	replacementHTML: string;
  connections: number[];
  size: number;
  color: string;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
}

interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

interface Dimensions {
  width: number;
  height: number;
}

interface GraphProps {
  nodes: Record<string, {
    changeType: ChangeType;
    descriptionText: string;
    querySelector: string;
		replacementHTML: string;
    connections: number[];
  }>;
	selectedNode: NodeData;
	setSelectedNode: (node: NodeData | null) => void;
  applyNodeChangesToPage: (node: NodeType) => void;
}

// Simulation node type for D3
interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  changeType: ChangeType;
  descriptionText: string;
  querySelector: string;
  size: number;
  color: string;
  group: number;
}

// Simulation link type for D3
interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: SimulationNode;
  target: SimulationNode;
}

const changeTypes: ChangeType[] = [
  "img_alt_added",
  "img_alt_altered",
  "img_contrast_altered",
  "page_contrast_altered",
  "page_navigation_altered",
  "page_skip_to_main_added"
];

const getChangeTypeGroup = (changeType: ChangeType): number => {
  return changeTypes.indexOf(changeType);
};

const getChangeTypeColor = (changeType: ChangeType): string => {
  const colors = ['#37B3B4', '#00779D', '#4F6B8D', '#98C4FB', '#6672C5'];
  return colors[changeTypes.indexOf(changeType) % colors.length];
};

const Graph: React.FC<GraphProps> = ({ selectedNode, setSelectedNode, nodes, applyNodeChangesToPage }) => {
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRef = useRef<d3.Selection<SVGCircleElement, NodeData, SVGGElement, unknown> | null>(null);
  const labelRef = useRef<d3.Selection<SVGTextElement, NodeData, SVGGElement, unknown> | null>(null);
  const linkRef = useRef<d3.Selection<SVGLineElement, LinkData, SVGGElement, unknown> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Sample data structure similar to Obsidian notes
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    if (nodes) {
      const newNodes: NodeData[] = Object.keys(nodes).map((key, index) => {
        const node = nodes[key];
        return {
          id: `${index}`,
          changeType: node.changeType,
          descriptionText: node.descriptionText,
          replacementHTML: node.replacementHTML,
          querySelector: node.querySelector,
          connections: node.connections,
          size: 8,
          color: getChangeTypeColor(node.changeType),
          group: getChangeTypeGroup(node.changeType),
        };
      });

      const newLinks: LinkData[] = Object.keys(nodes).map((key, index) => {
        const node = nodes[key];
        return node.connections.map((connectionIndex): LinkData => ({
          source: `${index}`,
          target: `${connectionIndex}`,
        }));
      }).flat();

      setGraphData({ nodes: newNodes, links: newLinks });
    }
  }, [nodes]);

  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 });

  const [showOptionsBar, setShowOptionsBar] = useState(false);
  const [slideInOptionsBar, setSlideInOptionsBar] = useState(false);
  const [optionsBarNode, setOptionsBarNode] = useState<NodeData | null>(null);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateDimensions = (): void => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!nodes || Object.keys(nodes).length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white">
        <p>No data available to display the graph.</p>
      </div>
    );
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    const filteredNodes = graphData.nodes;
    
    const filteredLinks = graphData.links.filter((link): boolean => 
      filteredNodes.some(node => node.id === link.source || (typeof link.source === 'object' && node.id === link.source.id)) &&
      filteredNodes.some(node => node.id === link.target || (typeof link.target === 'object' && node.id === link.target.id))
    );

    const simulation = d3.forceSimulation<SimulationNode>(filteredNodes as SimulationNode[])
      .force("link", d3.forceLink<SimulationNode, SimulationLink>(filteredLinks as SimulationLink[]).id(d => d.id).distance(55))
      .force("charge", d3.forceManyBody<SimulationNode>().strength(-250))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<SimulationNode>().radius(d => d.size + 5));

    const container = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        container.attr("transform", event.transform.toString());
      });

    svg.call(zoom);
    zoomRef.current = zoom; // Store zoom behavior

    const link = container.append("g")
      .selectAll("line")
      .data(filteredLinks)
      .enter().append("line")
      .attr("stroke", theme === 'dark' ? "#9ca3af" : "#4a5568") // Dark mode link color
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    linkRef.current = link;

    const node = container.append("g")
      .selectAll("circle")
      .data(filteredNodes)
      .enter().append("circle")
      .attr("r", d => d.id === selectedNode?.id ? d.size * 2 : d.size)
      .attr("fill", d => d.color)
      .attr("stroke", theme === 'dark' ? "#374151" : "#fff") // Dark mode node stroke
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("opacity", d => d.id === selectedNode?.id || !selectedNode ? 1 : 0.3)
      .call(d3.drag<SVGCircleElement, NodeData>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    const label = container.append("g")
      .selectAll("text")
      .data(filteredNodes)
      .enter().append("text")
      .text(d => d.changeType[0].toUpperCase())
      .attr("font-size", "12px")
      .attr("font-family", "Arial, sans-serif")
      .attr("fill", theme === 'dark' ? "#e2e8f0" : "#e2e8f0") // Dark mode label color
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .style("opacity", d => d.id === selectedNode?.id || !selectedNode ? 1 : 0.3);

    node
      .on("click", (event: MouseEvent, d: NodeData) => {
        setSelectedNode(d);
        event.stopPropagation();
      })
      .on("mouseover", function(event: MouseEvent, d: NodeData) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.id === selectedNode?.id ? d.size * 2.2 : d.size * 1.2) // Hover effect: slightly larger than base
          .attr("stroke-width", 3);
        
        node.style("opacity", (n) => n.id === d.id ? 1 : (selectedNode ? 0.3 : 1));
        link.style("opacity", (l: LinkData) => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? l.target.id : l.target;
          return (sourceId === d.id || targetId === d.id) ? 1 : (selectedNode ? 0.1 : 0.6);
        });
        label.style("opacity", (n: NodeData) => n.id === d.id ? 1 : (selectedNode ? 0.3 : 1));
      })
      .on("mouseout", function(event: MouseEvent, d: NodeData) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.id === selectedNode?.id ? d.size * 2 : d.size) // Revert to base size (selected or unselected)
          .attr("stroke-width", 2);
        
        if (selectedNode) {
          node.style("opacity", (n) => n.id === selectedNode.id ? 1 : 0.3);
          link.style("opacity", 0.1);
          label.style("opacity", (n) => n.id === selectedNode.id ? 1 : 0.3);
        } else {
          node.style("opacity", 1);
          link.style("opacity", 0.6);
          label.style("opacity", 1);
        }
      });

    svg.on("click", () => setSelectedNode(null));

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData): void {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData): void {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>, d: NodeData): void {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    simulation.on("tick", () => {
      link
        .attr("x1", (d: SimulationLink) => (d.source as SimulationNode).x)
        .attr("y1", (d: SimulationLink) => (d.source as SimulationNode).y)
        .attr("x2", (d: SimulationLink) => (d.target as SimulationNode).x)
        .attr("y2", (d: SimulationLink) => (d.target as SimulationNode).y);

      node
        .attr("cx", (d: NodeData) => d.x || 0)
        .attr("cy", (d: NodeData) => d.y || 0);

      label
        .attr("x", (d: NodeData) => d.x || 0)
        .attr("y", (d: NodeData) => d.y || 0);
    });

    nodeRef.current = node; // Store node selection
    labelRef.current = label; // Store label selection

    return () => simulation.stop();
  }, [selectedNode, graphData, dimensions, theme]);

  useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current
        .attr("r", d => d.id === selectedNode?.id ? d.size * 2 : d.size)
        .style("opacity", d => d.id === selectedNode?.id ? 1 : 0.3);
    }

    if (labelRef.current) {
      labelRef.current.style("opacity", d => d.id === selectedNode?.id ? 1 : 0.3);
    }

    if (linkRef.current) {
      linkRef.current.style("opacity", selectedNode ? 0.1 : 0.6);
    }

    if (selectedNode && svgRef.current && zoomRef.current) {
      const targetNode = graphData.nodes.find(n => n.id === selectedNode.id);
      if (targetNode) {
        const { width, height } = dimensions;
        const scale = 2; // Zoom level
        const x = -targetNode.x * scale + width / 2;
        const y = -targetNode.y * scale + height / 2;
        d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity.translate(x, y).scale(scale));
      }
    } else if (!selectedNode && svgRef.current && zoomRef.current) {
      // Reset zoom when no node is selected
      d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, [selectedNode, dimensions, graphData.nodes, setSelectedNode]);

  

  
  
  
	

  useEffect(() => {
    if (selectedNode) {
      setOptionsBarNode(selectedNode);
      setShowOptionsBar(true);
      // Allow a very short moment for the component to render with initial state before sliding in
      const slideInTimeout = setTimeout(() => setSlideInOptionsBar(true), 10);
      return () => clearTimeout(slideInTimeout);
    } else {
      setSlideInOptionsBar(false); // Start sliding out
      const hideTimeout = setTimeout(() => setShowOptionsBar(false), 300); // Hide after animation
      return () => clearTimeout(hideTimeout);
    }
  }, [selectedNode]);

	async function executeChange(selectedNode: NodeData) {
		const querySelector = selectedNode.querySelector;
		const replacementHTML = selectedNode.replacementHTML;
		const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: (selector: string, html: string) => {
            const elem = document.querySelector(selector);
            if(!elem) return;
						if(selector != 'body'){
							elem.outerHTML = html
						} else {
							elem.innerHTML = html + elem.innerHTML
						}
        },
        args: [querySelector, replacementHTML]
    });

		setGraphData(graphData => {
			const newNodes = graphData.nodes.filter(a => a.id !== selectedNode.id);
			const newLinks = graphData.links.filter(link => {
				const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
				const targetId = typeof link.target === 'object' ? link.target.id : link.target;
				return sourceId !== selectedNode.id && targetId !== selectedNode.id;
			});
			return {
				nodes: newNodes,
				links: newLinks
			};
		});
		setSelectedNode(null)
	}

  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white relative overflow-hidden">
      {showOptionsBar && optionsBarNode && (
        <div
          className={`absolute right-0 bg-white dark:bg-gray-900 p-0 z-10 w-1/3 h-full flex flex-col transition-transform duration-300 ease-out ${
            slideInOptionsBar ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="bg-white dark:bg-gray-900 rounded-t-lg px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg text-[#44455A] dark:text-white">{optionsBarNode.changeType}</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="font-bold text-[#44455A] dark:text-gray-200 mb-2 text-sm">Description</h4>
            <p className="text-[#5C5C6D] dark:text-gray-300 leading-relaxed">{optionsBarNode.descriptionText}</p>
          </div>
          
					<div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
					<p className="text-md text-gray-500 dark:text-gray-400 mb-3 font-mono break-all">
					{optionsBarNode.querySelector}
					</p>
					<div className='flex justify-around'>
					<button
					onClick={() => setSelectedNode(null)}
					className="w-2/5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors font-medium btn-gradient-hover text-gray-800 dark:text-white"
					>
					Close
					</button>
					<Button
					onClick={() => executeChange(selectedNode)}
					variant="outline"
					className="w-2/5 text-black dark:text-white dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
					>
					Execute 
					</Button>
					</div>
					</div>
					</div>
			)}

			<div className='w-full flex justify-start flex-col items-start h-[40%] left-4 top-4 absolute bg-transparent pointer-events-none'>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
			{/* Remove Button wrapper to avoid size constraints */}
			<div className="cursor-pointer p-2 pointer-events-auto"> {/* Add padding for touch target */}
				<Lightbulb
			className="w-6 h-6 text-[#333348] dark:text-gray-300"
			fill={dialogOpen ? (theme === 'dark' ? "#ADD8E6" : "#ADD8E6") : "none"}
			/>
			</div>
			</DialogTrigger>
			<DialogContent 
			className="fixed right-4 top-[50%] max-h-[80vh] max-w-md overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
			>
			<div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
			<div className="flex items-center gap-2 mb-2">
			<h1 className="text-2xl font-bold text-gray-800 dark:text-white">Accessibility Issues Overview</h1>
			</div>

  <p className="text-gray-600 dark:text-gray-300 mb-6">
    This Chrome extension scans your website for accessibility issues and displays them as clickable nodes.
  </p>
  
  <hr className="border-gray-300 dark:border-gray-600 mb-6" />
  
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">How It Works:</h2>
    </div>
    
    <div className="ml-7 space-y-2 text-gray-700 dark:text-gray-300">
      <p>- Each <span className="font-semibold">node</span> represents a specific <span className="font-semibold">accessibility issue</span> found on the page.</p>
      <p>- Clicking a node will show you:</p>
      <div className="ml-4 space-y-1">
        <p>A <span className="font-semibold">description</span> of the issue</p>
        <p>° The <span className="font-semibold">type</span> of accessibility problem (e.g. contrast, missing lables, etc.)</p>
        <p>° An option to <span className="font-semibold">fix it manually</span> or <span className="font-semibold">automatically</span></p>
      </div>
    </div>
  </div>
  
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Two Modes of Use:</h2>
    </div>
    
    <div className="ml-7 space-y-4">
      <div>
        <h3 className="font-semibold text-teal-500 mb-2">Developer Mode:</h3>
        <div className="space-y-1 text-gray-700 dark:text-gray-300">
          <p>° Click on each node to review and <span className="font-semibold">manually fix</span> issues.</p>
          <p>° Great for learning how to improve accessibility yourself.</p>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-teal-500 mb-2">User Mode:</h3>
        <div className="space-y-1 text-gray-700 dark:text-gray-300">
          <p>° The extension will <span className="font-semibold">automatically fix</span> accessibility issues when the page is rendered.</p>
          <p>° This helps users with disabilities have a more accessible browsing experience without needing to click anything.</p>
        </div>
      </div>
    </div>
  </div>
  
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Lightbulb className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tip:</h2>
    </div>
    
    <p className="ml-7 text-gray-700 dark:text-gray-300">
      Use this tool to ensure your website is accessible to everyone, including people using screen readers, keyboard navigation, or other assistive technologies.
    </p>
  </div>
</div>
			</DialogContent>
			</Dialog>
			</div>
			{/* SVG Graph */}
			<svg
			ref={svgRef}
			width={dimensions.width}
			height={dimensions.height}
			className="w-full h-full"
			>
			</svg>
			</div>
	);
};

export default Graph;
