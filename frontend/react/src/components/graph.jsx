import nodes from '../tempJson';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

let changeTypes = ["img_alt_added","img_alt_altered","img_contrast_altered","page_contrast_altered","page_navigation_altered","page_skip_to_main_added"];

const getChangeTypeGroup = (changeType) => {
	return changeTypes.indexOf(changeType);
};

const getChangeTypeColor = (changeType) => {
	return ['#64748b', '#dc2626', '#2563eb', '#059669', '#7c3aed'][changeTypes.indexOf(changeType)%6]
};


const Graph = () => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Sample data structure similar to Obsidian notes
  const [graphData, setGraphData] = useState({
		nodes: Object.keys(nodes).map((i, n) => {
			n = nodes[n];
			n.id = `${i}`;
			n.size = 12;
			n.color = getChangeTypeColor(n.changeType);
			n.group = getChangeTypeGroup(n.changeType);
			return n;
		}),
		links: Object.keys(nodes).map((i, n) => {
			n = nodes[n];
			return n.connections.map(j => {
				return { source: `${i}`, target: `${j}` }
			})
		}).flat()
  });

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
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
    
    const filteredLinks = graphData.links.filter(link => 
      filteredNodes.some(node => node.id === link.source || node.id === link.source.id) &&
      filteredNodes.some(node => node.id === link.target || node.id === link.target.id)
    );

    const simulation = d3.forceSimulation(filteredNodes)
      .force("link", d3.forceLink(filteredLinks).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.size + 5));

    const container = svg.append("g");

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
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
      .call(d3.drag()
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
      .on("click", (event, d) => {
        setSelectedNode(d);
        event.stopPropagation();
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.size * 1.2)
          .attr("stroke-width", 3);
        
        // Highlight connected nodes
        const connectedNodes = new Set();
        filteredLinks.forEach(l => {
          if (l.source.id === d.id) connectedNodes.add(l.target.id);
          if (l.target.id === d.id) connectedNodes.add(l.source.id);
        });
        
        node.style("opacity", n => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.3);
        link.style("opacity", l => l.source.id === d.id || l.target.id === d.id ? 1 : 0.1);
        label.style("opacity", n => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.3);
      })
      .on("mouseout", function(event, d) {
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

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    return () => simulation.stop();
  }, [graphData, dimensions]);

  const addNode = () => {
    const newNode = {
      id: `New Node ${Date.now()}`,
      group: Math.floor(Math.random() * 6) + 1,
      size: Math.random() * 15 + 8,
      color: ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#ea580c', '#be123c'][Math.floor(Math.random() * 6)]
    };
    
    const existingNode = graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)];
    const newLink = {
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
</div>)}

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
