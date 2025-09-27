import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

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
  connections: string[];
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
    connections: string[];
  }>;
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
  const colors = ['#64748b', '#dc2626', '#2563eb', '#059669', '#7c3aed'];
  return colors[changeTypes.indexOf(changeType) % colors.length];
};

const Graph: React.FC<GraphProps> = ({ nodes }) => {
	console.log(nodes);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  
  // Sample data structure similar to Obsidian notes
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: Object.keys(nodes).map((key, index): NodeData => {
      const node = nodes[key];
      return {
        id: `${index}`,
        changeType: node.changeType,
        descriptionText: node.descriptionText,
        querySelector: node.querySelector,
        connections: node.connections,
        size: 12,
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
      setDimensions({
        width: window.innerWidth - 40,
        height: window.innerHeight - 120
      });
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
      .force("link", d3.forceLink<SimulationNode, SimulationLink>(filteredLinks as SimulationLink[]).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody<SimulationNode>().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<SimulationNode>().radius(d => d.size + 5));

    const container = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        container.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    const link = container.append("g")
      .selectAll("line")
      .data(filteredLinks)
      .enter().append("line")
      .attr("stroke", "#4a5568")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    const node = container.append("g")
      .selectAll("circle")
      .data(filteredNodes)
      .enter().append("circle")
      .attr("r", d => d.size)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
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
      .style("user-select", "none");

    node
      .on("click", (event: MouseEvent, d: NodeData) => {
        setSelectedNode(d);
        event.stopPropagation();
      })
      .on("mouseover", function(event: MouseEvent, d: NodeData) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.size * 1.2)
          .attr("stroke-width", 3);
        
        // Highlight connected nodes
        const connectedNodes = new Set<string>();
        filteredLinks.forEach(l => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? l.target.id : l.target;
          
          if (sourceId === d.id) connectedNodes.add(targetId);
          if (targetId === d.id) connectedNodes.add(sourceId);
        });
        
        node.style("opacity", (n: NodeData) => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.3);
        link.style("opacity", (l: LinkData) => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? l.target.id : l.target;
          return sourceId === d.id || targetId === d.id ? 1 : 0.1;
        });
        label.style("opacity", (n: NodeData) => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.3);
      })
      .on("mouseout", function(event: MouseEvent, d: NodeData) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.size)
          .attr("stroke-width", 2);
        
        node.style("opacity", 1);
        link.style("opacity", 0.6);
        label.style("opacity", 1);
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

    return () => simulation.stop();
  }, [graphData, dimensions]);

  const addNode = (): void => {
    const colors = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#ea580c', '#be123c'];
    const newNode: NodeData = {
      id: `New Node ${Date.now()}`,
      changeType: 'img_alt_added', // Default change type
      descriptionText: 'New node description',
      querySelector: 'new-selector',
      connections: [],
      group: Math.floor(Math.random() * 6) + 1,
      size: Math.random() * 15 + 8,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    const existingNode = graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)];
    const newLink: LinkData = {
      source: newNode.id,
      target: existingNode.id
    };
    
    setGraphData(prev => ({
      nodes: [...prev.nodes, newNode],
      links: [...prev.links, newLink]
    }));
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white relative overflow-hidden">
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-0 z-10 w-64 h-[calc(100vh-2rem)] flex flex-col">
          <div className="bg-gray-700 rounded-t-lg px-4 py-3 border-b border-gray-600">
            <h3 className="font-semibold text-lg text-white">{selectedNode.changeType}</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="font-medium text-gray-300 mb-2 text-sm">Description</h4>
            <p className="text-gray-200 leading-relaxed">{selectedNode.descriptionText}</p>
          </div>
          
          <div className="border-t border-gray-600 p-4 bg-gray-750">
            <p className="text-xs text-gray-500 mb-3 font-mono break-all">
              {selectedNode.querySelector}
            </p>
            <button
              onClick={() => setSelectedNode(null)}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  );
};

export default Graph;
