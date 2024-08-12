import React from 'react';
import '../../styles/FamilyTreeView.css';
import { GEDContext } from '../../types/GEDContext';
import ContextManager from '../../utils/ContextManager';
import TreeIndexView from './TreeIndexView';
import TreeLayoutView, {OnIndexSelect} from './TreeLayoutView'
import GEDFileGetter from './GEDFileGetter';
import TreeBuilder from '../../utils/TreeBuilder';
import PersonInfo from './PersonInfo';

const params: OnIndexSelect = {}

function FamilyTreeView(props: GEDContext) {
  
  params.callback = onIndexSelect;

  function onIndexSelect(callback: (() => void)) {
    ContextManager.getInstance().getContext().onIndexSelect = callback;
  }

  const ctx = ContextManager.getInstance().getContext();
  const treeBuilder = new TreeBuilder();
  treeBuilder.build();

  return (
    <div className="family-tree-container">
        <div className='ged-buttons-bar-container'>
          <div><GEDFileGetter {...ctx}/></div>
        </div>
        <div className='family-tree-view-container'>
          <div id='familyTreeIndex' className="tree-index-container">
            <TreeIndexView { ...ctx}/>  
          </div>
          <div id="personInfoContainer" className="person-info-container">
            <PersonInfo />
          </div>
          <div id="familyTreeView" className="tree-layout-container">
                <TreeLayoutView  {...params}/>  
          </div>
        </div>
    </div>
  )
}
  
export default FamilyTreeView;

