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
    const sex = p.getData().sex as string;

    let className = 'person-view';
    className = className.concat( " ", "person-view", "-", sex);
 
    let title = pName;
    const birth = props.person.getBirthYear();
    const death = props.person.getDeathYear();
    if (isSpouse)  title = 'sp: ' + pName;
    if (birth || death) {
      title += ' (';
      if (birth) title += ' b. ' + birth;
      if (death) title += ' d. ' + death;
      title += ' )';
    }
   
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
        return (
          <>
            <div key={'pv-' + p.getID()} className={className} style={{ paddingLeft: 4 + 'px' }}>
                {props.callback && 
                    <Hyperlink 
                      linkID={p.getID()} 
                      title={title} 
                      class={className}
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
