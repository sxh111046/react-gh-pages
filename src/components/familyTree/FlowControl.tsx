    import React from 'react';
    import { useStoreApi, useReactFlow, Panel, ReactFlowState} from 'reactflow';
    import ContextManager from '../../utils/ContextManager';
    import 'reactflow/dist/style.css';

    const panelStyle = {
    color: '#777',
    fontSize: 12,
    };

    const buttonStyle = {
    fontSize: 12,
    marginRight: 5,
    marginTop: 5,
    };

    export interface FlowControlProps {
        onNodeFocus: () => void;
    }

    function  FlowControl() {
        const store = useStoreApi();
        const {getZoom, setViewport, setCenter} = useReactFlow();
        let currentZoom = getZoom();

        const selector = (s: ReactFlowState) => {
            return {
              unselectAll: s.unselectNodesAndEdges
            };
          };

        const focusNode = () => {
            const ctx = ContextManager.getInstance().getContext();
            let alignment = 'center';
            let nodeID = ctx.selectedPerson?.getID();
            if (!nodeID || (ctx.selectedPerson?.getID() === ctx.subtreeRoot?.getID())) {
                nodeID = ctx.subtreeRoot?.getID();
                alignment = 'top';
            }
            
            const node = findNode(nodeID as string);
            const zoom = currentZoom;
            if (node) {
                clearSelection();
                node.selected = true;
                const w = node.width  as number;
                const h = node.height as number;
                let x = node.position.x + w / 2;
                const y = node.position.y + h / 2;
            
                if (node && alignment === 'center') {
                    // fitView();
                    setCenter(x, y, { zoom, duration: 1000 });
                } else if (node) {
                    setViewport({ x, y, zoom: currentZoom});
                } 
            }
        };

        function findNode(nodeID: string): any {
            const { nodeInternals } = store.getState();
            const nodes = Array.from(nodeInternals).map(([, node]) => node);
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.id === nodeID) {
                   return node;
                }
            }
            return undefined
        }

        const handleZoomIn = (event: any) => {

        }

        const handleZoomOut = (event: any) => {

        }

        function clearSelection() {
            const s = store.getState();
            const unselectAll = selector(s);
            unselectAll.unselectAll();
        }

        ContextManager.getInstance().getContext().onFocusNode = focusNode;
        // const ctx = ContextManager.getInstance().getContext();

        return (
            <Panel position="top-left" style={panelStyle}>
                <div>
                    <button hidden onClick={focusNode} style={buttonStyle}>
                    focus node
                    </button>
                    <button hidden onClick={handleZoomIn} style={buttonStyle}>
                    zoom in
                    </button>
                    <button hidden onClick={handleZoomOut} style={buttonStyle}>
                    zoom out
                    </button>
                </div>
            </Panel>
        );
    };

    export default FlowControl;