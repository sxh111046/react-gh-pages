  import { useState } from 'react';
  import ContextManager from '../../utils/ContextManager';
  import ReactFlow, {
    ReactFlowProvider,
    FitViewOptions,
    Node,
    Edge,
    MiniMap,
    BackgroundVariant,
    Background,
    DefaultEdgeOptions,
    ConnectionLineType,
    NodeTypes,
    Controls
  } from 'reactflow';
  
  import CustomNode from './CustomNode';
  import Buttons from './FlowControl';
  import TreeIndex from '../../utils/TreeIndex';
  import Person from '../../utils/Person';
  import SubtreeGenerator from '../../utils/SubtreeGenerator';
  import 'reactflow/dist/style.css';
  import '../../styles/FamilyTreeView.css';
  
  const fitViewOptions: FitViewOptions = {
    padding: 0.2,
  };

  const minimapStyle = {
    height: 120,
    backgroundColor: "#666"
  };
  
  const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
  };
  
  const nodeTypes: NodeTypes = {
    CustomNode: CustomNode,
  };
  
  export interface OnIndexSelect {
    callback?: (cb: () => void) => void;
  }

  function TreeLayoutView(props?: OnIndexSelect ) {

      const subtreeGenerator = new SubtreeGenerator();

      const initialNodes: Node[] = new Array<Node>();
      const initialEdges: Edge[] = new Array<Edge>();

      const [, setStateCounter] = useState(0);

      function onNodeClick (e: React.MouseEvent, node: Node) {
        node.selected = true;
        const p = TreeIndex.getInstance().getPerson(node.id);
        if (p) {
          if (e.target instanceof(HTMLImageElement)) {
            handleCollapseExpand(p);
          } else {
            setNewSubtree(node.id);
          }
        }
      }

      function handleCollapseExpand(p: Person) {
          const ctx = ContextManager.getInstance().getContext();
          if (!ctx.collapsedSubtrees?.includes(p)) {
            ctx.collapsedSubtrees?.push(p);
          } else {
            const index = ctx.collapsedSubtrees.indexOf(p);
            ctx.collapsedSubtrees.splice(index, 1);
          }
          collapseExpandTree(p);
      }

      function insureTreeIndex(): boolean {
        return TreeIndex.getInstance() !== undefined;
      }

      function update() {
        ContextManager.getInstance().upStateCounter();
        setStateCounter(ctx.stateCounter as number);
      }
  
      function collapseExpandTree(p: Person) {
        ContextManager.getInstance().setSeletedPerson(p);
        setTimeout(() => {
          update();
        }, 100)
      }

      function setNewSubtree(pID: string) {
        TreeIndex.getInstance().setNewSubtree(pID);
        setTimeout(() => {
          update();
        }, 100)
      }

      function updateNodes() {
        const personalViews = subtreeGenerator.generate(ctx.subtreeRoot as Person); // props.personViews;
        if (personalViews && personalViews.length) {
          for (let i = 0; i < personalViews.length; i++) {
            const pv = personalViews[i];
            const p = pv.person;
            const gen = p.getGen();
            initialNodes.push({id: p.getID(), position:{x: (gen + 1) * 30, y: i * 30}, data: {value: pv}, type: 'CustomNode'});
          }
        }
      }

      function updateConnectors() {
          const connectors = subtreeGenerator.getConnectors(); //props.connectors;
          connectors.forEach((value: string[], key: string) => {
            addEdge(key, value);
        });
      }

      function addEdge(from: string, to: string[]) {
        to.forEach((target) =>  {
          const key = 'to-' + from + '-' +  target;
          const edge = { id: key, source: from, target: target, type: 'step', animated: false };
          if (!initialEdges.includes(edge)) {
            console.log('edge ' + key);
            initialEdges.push(edge);
          }
          
        })
      }

      function updatePersonInfo() {
        const personChanged = ctx.onPersonSelectedChanged;
        personChanged?.map((value) => {
          return value();
        })
      }

      setTimeout( () => {
        while(!insureTreeIndex()) {}
      }, 30)
      
      const ctx = ContextManager.getInstance().getContext();
      ContextManager.getInstance().setOnSelect(() => setNewSubtree);
      const callback = props?.callback;
      if (callback) callback(update);
   
      updateNodes();
      updateConnectors();
      
    
      setTimeout(() => {
        if (ctx.onFocusNode) ctx.onFocusNode();
        updatePersonInfo();
      }, 200)

      return (
        <ReactFlowProvider>
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            connectionLineType={ConnectionLineType.Step}
            fitView
            fitViewOptions={fitViewOptions}
            defaultEdgeOptions={defaultEdgeOptions}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            attributionPosition= "bottom-left"
          >
            <Background color="#ccc" variant={BackgroundVariant.Dots} />
            <MiniMap style={minimapStyle} zoomable pannable />
            <Controls />
            <Buttons  />
          </ReactFlow>
        </ReactFlowProvider>
      );
  }

  export default TreeLayoutView

// <MiniMap pannable zoomable nodeStrokeWidth={7} nodeColor={'#e2e2e2'} zoomStep={5} />