import React, { useEffect, useRef } from 'react';
import cytoscape, { Core } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';

if (typeof window !== 'undefined') {
  try {
    cytoscape.use(dagre);
  } catch (e) {
    // Registered
  }
}

interface NetworkNode {
  id: string;
  label?: string;
  name?: string;
  bank?: string;
  risk_score?: number;
  risk_level?: string;
  is_primary?: boolean;
}

interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  count?: number;
  transaction_id?: string;
}

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  onSelectAccount?: (accountId: string) => void;
  highlightCycle?: string[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  onSelectAccount,
  highlightCycle = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cyElements = [
      ...nodes.map((n) => {
        const score = n.risk_score || 0;
        let color = '#2563EB'; // Blue (Normal / Low)
        if (score >= 81) color = '#DC2626'; // Red (CRITICAL)
        else if (score >= 61) color = '#EA580C'; // Orange (HIGH)
        else if (score >= 31) color = '#D97706'; // Amber (MEDIUM)

        const size = Math.max(40, Math.min(75, 40 + score * 0.35));

        return {
          data: {
            id: n.id,
            label: n.id,
            riskScore: score,
            color: color,
            size: size,
            isPrimary: n.is_primary || false
          }
        };
      }),
      ...edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: `₹${(e.amount || 0).toLocaleString('en-IN')}`,
          amount: e.amount
        }
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: cyElements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#0F172A',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-wrap': 'wrap',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': 3,
            'border-color': '#FFFFFF'
          }
        },
        {
          selector: 'node[?isPrimary]',
          style: {
            'border-width': 4,
            'border-color': '#1E40AF'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2.5,
            'line-color': '#94A3B8',
            'target-arrow-color': '#64748B',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '11px',
            'font-weight': 'bold',
            'color': '#334155',
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.95,
            'text-background-padding': '3px',
            'text-border-width': 1,
            'text-border-color': '#E2E8F0',
            'text-border-opacity': 0.8
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#2563EB',
            'target-arrow-color': '#2563EB',
            'width': 4
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#DC2626'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeOverlap: 30,
        idealEdgeLength: 120,
        componentSpacing: 120
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onSelectAccount) {
        onSelectAccount(node.id());
      }
    });

    // Highlight cycle if passed
    if (highlightCycle.length > 1) {
      for (let i = 0; i < highlightCycle.length; i++) {
        const u = highlightCycle[i];
        const v = highlightCycle[(i + 1) % highlightCycle.length];
        cy.elements(`node[id = "${u}"]`).style({
          'border-color': '#DC2626',
          'border-width': 4
        });
        cy.elements(`edge[source = "${u}"][target = "${v}"]`).style({
          'line-color': '#DC2626',
          'target-arrow-color': '#DC2626',
          'width': 4.5
        });
      }
    }

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, highlightCycle]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();
  const handleResetLayout = () => {
    cyRef.current?.layout({ name: 'cose', animate: true }).run();
  };

  return (
    <div className="relative w-full h-[550px] bg-slate-50/70 rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div ref={containerRef} className="w-full h-full" />

      {/* Control Buttons Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white shadow-md p-1.5 rounded-lg border border-slate-200 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="Fit Canvas"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetLayout}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="Re-layout Graph"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Graph Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600" />
          <span>Normal / Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-600" />
          <span>Medium (31-60)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-600" />
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600" />
          <span>Critical Risk</span>
        </div>
      </div>
    </div>
  );
};
