import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Lightbulb } from 'lucide-react';
import * as d3 from 'd3';
import { Textarea } from './ui/textarea';

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
	setSelectedNode: any;
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

const Graph: React.FC<GraphProps> = ({ selectedNode, setSelectedNode, nodes }) => {
  if (!nodes || Object.keys(nodes).length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white">
        <p>No data available to display the graph.</p>
      </div>
    );
  }
	
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRef = useRef<d3.Selection<SVGCircleElement, NodeData, SVGGElement, unknown> | null>(null);
  const labelRef = useRef<d3.Selection<SVGTextElement, NodeData, SVGGElement, unknown> | null>(null);
  const linkRef = useRef<d3.Selection<SVGLineElement, LinkData, SVGGElement, unknown> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Sample data structure similar to Obsidian notes
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: Object.keys(nodes).map((key, index): NodeData => {
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
    }),
    links: Object.keys(nodes).map((key, index): LinkData[] => {
      const node = nodes[key];
      return node.connections.map((connectionIndex): LinkData => ({
        source: `${index}`,
        target: `${connectionIndex}`,
      }));
    }).flat()
  });

  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 });

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
      .attr("stroke", "#4a5568")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    linkRef.current = link;

    const node = container.append("g")
      .selectAll("circle")
      .data(filteredNodes)
      .enter().append("circle")
      .attr("r", d => d.id === selectedNode?.id ? d.size * 2 : d.size)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
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
      .text(d => d.changeType[0])
      .attr("font-size", "12px")
      .attr("font-family", "Arial, sans-serif")
      .attr("fill", "#e2e8f0")
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
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

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
  }, [selectedNode, graphData, dimensions]);

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
  }, [selectedNode, dimensions, graphData.nodes]);

  

  const [showOptionsBar, setShowOptionsBar] = useState(false);
  const [slideInOptionsBar, setSlideInOptionsBar] = useState(false);
  const [optionsBarNode, setOptionsBarNode] = useState<NodeData | null>(null);
	const [popOverOpen, setPopOverOpen] = useState<Boolean>(false);

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

	async function executeChange(querySelector: string, replacementHTML: string) {
		console.log(querySelector, replacementHTML);
		console.log(selectedNode);
		const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: (selector: string, html: string) => {
            const elem = document.querySelector(selector);
            if(elem) elem.outerHTML = html;
        },
        args: [querySelector, replacementHTML]
    });
	}

  return (
    <div className="w-full h-screen bg-gray-100 text-white relative overflow-hidden">
      {showOptionsBar && optionsBarNode && (
        <div
          className={`absolute right-0 bg-white p-0 z-10 w-1/3 h-full flex flex-col transition-transform duration-300 ease-out ${
            slideInOptionsBar ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="bg-white rounded-t-lg px-4 py-3 border-b border-gray-600">
            <h3 className="font-semibold text-lg text-[#44455A]">{optionsBarNode.changeType}</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="font-bold text-[#44455A] mb-2 text-sm">Description</h4>
            <p className="text-[#5C5C6D] leading-relaxed">{optionsBarNode.descriptionText}</p>
          </div>
          
					<div className="border-t border-gray-600 p-4 bg-gray-750">
					<p className="text-md text-gray-500 mb-3 font-mono break-all">
					{optionsBarNode.querySelector}
					</p>
					<div className='flex justify-around'>
					<button
					onClick={() => setSelectedNode(null)}
					className="w-2/5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors font-medium btn-gradient-hover"
					>
					Close
					</button>
					<Button
					onClick={() => executeChange(selectedNode.querySelector, selectedNode.replacementHTML)}
					variant="outline"
					className="w-2/5 text-black"
					>
					Execute 
					</Button>
					</div>
					</div>
					</div>
			)}

			<div className='w-full flex justify-start flex-col items-start h-[40%] left-4 top-4 absolute bg-transparent pointer-events-none'>
			<Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
			<PopoverTrigger asChild>
			{/* Remove Button wrapper to avoid size constraints */}
			<div className="cursor-pointer p-2 pointer-events-auto"> {/* Add padding for touch target */}
				<Lightbulb
			className="w-6 h-6 text-[#333348]"
			fill={popOverOpen ? "#111" : "none"}
			/>
			</div>
			</PopoverTrigger>
			<PopoverContent 
			side="right" 
			align="start"
			sideOffset={10} // Adds space between icon and popover
			className="w-64" // Optional: control popover width
			>
			<p>This is the popover content!</p>
			</PopoverContent>
			</Popover>
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
