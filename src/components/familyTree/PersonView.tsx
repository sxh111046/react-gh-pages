import React  from 'react';
import '../../styles/FamilyTreeView.css';
import Person from '../../utils/Person';
import Hyperlink from '../common/Hyperlink';
import ContextManager from '../../utils/ContextManager';

export interface PersonViewProps {
    person: Person;
    type: string;
    gen: number;
    hyperlink?: boolean;
    callback?: (event: any) => void;
    sourcePosition?: string;
    targetPosition?: string;
    style?: {};
    image?: any;
}

function PersonView (props: PersonViewProps) {

    const p = props.person;
    const pName = props.person.getName();
    const isSpouse = props.type === 'spouse';
    
    const isTopPerson = p.isTopPerson();

    let className = 'person-view' 
    if (props.person.isRoot()) className = '';
 
    let title = pName;
    if (isSpouse)  title = 'sp: ' + pName;

    function getCollapseImage(): JSX.Element {
      const ctx = ContextManager.getInstance().getContext();
      const collapsedSubtrees = ctx.collapsedSubtrees;
      if (collapsedSubtrees?.includes(props.person)) {
        return (
            <img id="expandImage" className="expand-image" alt=' '/>
          );
      } else {
        return(
            <img id="collapseImage" className="collapse-image" alt=' '/>
          );
      }
    }

    if (props.hyperlink) {
      if (props.person.isRoot() || isTopPerson) {
        className = 'person-view'; //'top-person';
      }
        return (
          <>
            <div key={'pv-' + p.getID()} className={className} style={{ paddingLeft: 4 + 'px' }}>
                {props.callback && 
                    <Hyperlink 
                      linkID={p.getID()} 
                      title={title} 
                      callback={props.callback} 
                      />} 
            </div>
            <div className="collapse-image-container">{getCollapseImage()}</div>
          </>
          )
        } else {
          return (
            <div  key={'pv-' + p.getID()} 
                className={className} 
                id={p.getID()} 
                style={{ paddingLeft: 4 + 'px' }}>
                {title}
            </div>
        )
      }
}
  
export default PersonView;
