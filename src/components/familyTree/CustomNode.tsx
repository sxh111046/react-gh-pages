import { Node, NodeProps, Position, Handle} from 'reactflow';
import PersonView, { PersonViewProps } from './PersonView'
import ContextManager from '../../utils/ContextManager';
 
type NodeData = {
    id: string;
    value: PersonViewProps;
    sourcePosition: 'bottom';
    targetPosition: 'left';
    style: {background: '#fff',
      backgroundColor: 'transparent', // "#fff",
      fontSize: 14,
      padding: 1,
      height: 16,};
  }   
 
type CustomNode = Node<NodeData>;
 
function CustomNode({ data }: NodeProps<NodeData>) {

  const p = data.value.person;
  const id = p.getID();
  if (p.isTopPerson()) {
    data.sourcePosition = 'bottom';
  } else {
    data.targetPosition = 'left';
  }
  if (!(data.value.type === 'spouse') && p.hasChildren()) {
    data.value.callback = ContextManager.getInstance().getContext().onSelect;
    data.value.hyperlink = true;
  }
  
  data.style =  {
    background: '#fff',
    backgroundColor: "transparent",
    fontSize: 14,
    padding: 1,
    height: 16,
  }
  
  return (
    <div key={'node-' + id} id={id} className='node-style' style= {data.style}>
        <Handle type="target" position={Position.Left} />
        <PersonView {...data.value} /> 
        <Handle type="source" position={Position.Left} />
    </div>
  )
}

export default CustomNode