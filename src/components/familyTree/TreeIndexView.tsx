import React, {useState, KeyboardEvent} from 'react';
import '../../styles/FamilyTreeView.css';
import { GEDContext } from '../../types/GEDContext';
import { PersonIndex } from '../../types/PersonIndex';
import ContextManager from '../../utils/ContextManager';
import TreeIndex from '../../utils/TreeIndex';
import Person from '../../utils/Person';
import Hyperlink from '../common/Hyperlink';
import { MenuItem } from '../../types/MenuItem';
import PersonSelectionMenu, {SelectionMenuProps} from './PersonSelectionMenu';
import SubtreeGenerator from '../../utils/SubtreeGenerator';

  const panelStyle = {
    color: '#777',
    fontSize: 12,
  };

  function TreeIndexView(props: GEDContext) {

    const [sortOrder, setSortOrder] = useState('person');
  
    const pIndex = props.personIndex as PersonIndex[];

    const ctx = ContextManager.getInstance().getContext();

    const familyIndex = ctx.familyIndex;

    let searchedItems: MenuItem[] = [];
    
    const byFamily = sortOrder === 'family';
    const byPerson = sortOrder === 'person';

    let indexClass = 'person-index';

    function handleIndexClick(event: any) {
      const selectedPerson = TreeIndex.getInstance().getPerson(event.currentTarget.id) as Person;
      onPersonSelection(selectedPerson);
    }

    function scrollIntoView(p: Person) {
      clearStyles();
      const pElement = document.getElementById('index-' + p.getID());
      pElement?.scrollIntoView({ behavior: 'smooth', block: 'center'});
      pElement?.classList.add("tree-index-selected-person");
    }

    function clearStyles() {
      if (byFamily) {
        familyIndex?.forEach((value) => {
            value.links?.forEach((link) => {
              const pElement = document.getElementById('index-' + link.getID());
              pElement?.classList.remove('tree-index-selected-person');
            })});
      } else {
        pIndex.forEach((value) => {
          const pElement = document.getElementById('index-' + value.id);
          pElement?.classList.remove('tree-index-selected-person');
        })
      }
    }

    function getFamilyIndexView(): JSX.Element[] {
      const familyIndexView = new Array<JSX.Element>();
      {familyIndex?.forEach((value) => {
        familyIndexView.push( <div key={value.index}><strong>{value.index}</strong></div>);
              {value.links?.forEach((link) => {
                familyIndexView.push(<div key={link.getID()} id={'index-' + link.getID()} className='family-index-person tree-index-person-text'><Hyperlink linkID={link.getID()} title={link.getName()} callback={handleIndexClick} /></div>);
              })}
        })}
        return familyIndexView;
    }

    function HighlightSelectPerson() {
      const ctxManager = ContextManager.getInstance();
      const selectedPerson = ctxManager.getContext().selectedPerson;
      if (selectedPerson) scrollIntoView(selectedPerson);
    }

    function onPersonSelection(p: Person) {
      const ctx = ContextManager.getInstance().getContext();
      const isRelated = (p.isRelated(ctx.subtreeRoot as Person) 
                        || p.getRelatedSpouse(ctx.subtreeRoot as Person) !== undefined);
      if (isRelated) {
        const stg = new SubtreeGenerator();
        const hidden = stg.expandHiddenBranches(p as Person);
        if(hidden && ctx.onIndexSelect) {
          ctx.onIndexSelect();
        }
        
        ctx.selectedPerson = p;
        const onSelects = ctx.onPersonSelectedChanged;
        onSelects?.forEach(fn => {
          fn();
        })
        setTimeout(() => {
          if (ctx.onFocusNode) ctx.onFocusNode();
        }, 100) 
      } else {
        ContextManager.getInstance().setSeletedPerson(p);
        const treeRoot = p.getRootAncestor(true) as Person; // TreeIndex.getInstance().getSubtreeRoot(p) as Person;
		  	if (treeRoot) {
          ContextManager.getInstance().setSubtreeRoot(treeRoot);
        }
        const onIndexSelect = ctx.onIndexSelect;
        if (onIndexSelect) onIndexSelect();
      } 
    }

    function sortByFamily() {
      setSortOrder('family');
    }

    function sortByPerson() {
      setSortOrder('person');
    }

    function getIndexPanel(): JSX.Element {
      const menuProps: SelectionMenuProps = {items: searchedItems,
                                             onGetItems:getSearchedItems, 
                                             onPersonSelection: onPersonSelection };
      return (
        <div className="tree-index-panel-container">
              <div className="index-panel" style={panelStyle}>
                <div className="button-sorter-container">
                  {byPerson &&  <button className="button-style" onClick={sortByFamily} >
                                  Sort by Family
                                </button> }
                  {byFamily &&   <button  className="button-style" onClick={sortByPerson} >
                                  Sort by Person
                                </button>}  
                </div>
                <div className="tree-index-search-panel">
                      <input className="tree-index-search-input" 
                        type='text' 
                        onChange={e => handleSearchValue(e.target.value)}
                        onKeyUpCapture={handleKeyboardEvent}
                      />
                      <img id="searchImage" alt=' ' className="tree-index-search-image" onClick={performSearch}/>ß
                      <div className="tree-index-popup">
                        <PersonSelectionMenu {...menuProps} />
                      </div>
                </div>
              </div>
        </div>
      )
    }

    function getIndexList():JSX.Element {
      return (
        <div className="tree-index-container-list">
                {byPerson &&
                    <div className={indexClass}> 
                        {pIndex.map((value, index) => {
                            return (<div key={index} id={'index-' + value.id} className='tree-index-person-text'><Hyperlink linkID={value.id} title={value.name} callback={handleIndexClick} /></div>)
                          })}
                    </div> }
                {byFamily &&
                  <div className={indexClass}> 
                    {getFamilyIndexView()}
                  </div>
                }
        </div>
      )
    }

    let searchValue = '';

    function performSearch(){
      if (searchValue) {
        const searchCollection = searchPesrons();
        triggerSelectionMenu(searchCollection);
      }
    }

    function handleSearchValue(text: string) {
      searchValue = text;
    }
    function searchPesrons(): Map<string, Person> {
      const searchCollection = new Map<string, Person>();
      const tempValue = searchValue.toLowerCase();
      if (byPerson) {
        {pIndex.forEach((value) => {
          const p = TreeIndex.getInstance().getPerson(value.id as string);
          const success = (p && (p.getData().surname?.toLowerCase().startsWith(tempValue) ||
                                p.getData().firstName?.toLowerCase().startsWith(tempValue)));
          if(success) {
            searchCollection.set(value.id as string, p);
          }
        })}
      } else if (byFamily) {
        {familyIndex?.forEach((value) => {
            {value.links?.forEach((link) => {
              const success = (link && (link.getData().surname?.toLowerCase().startsWith(tempValue) ||
                                link.getData().firstName?.toLowerCase().startsWith(tempValue)));
              if (success) {
                searchCollection.set(link.getID() as string, link);
              }
            })}
          })}
      }
      return searchCollection;
    }

    function getSearchedItems() : MenuItem[] {
      return searchedItems;
    }

    function handleKeyboardEvent(e: KeyboardEvent) {
      if (e.keyCode === 13) {
        searchValue = (e.currentTarget as HTMLTextAreaElement).value
        if (searchValue) {
          performSearch();
        }
      }
    };

    function triggerSelectionMenu(searchSelection: Map<string, Person>) {
      searchedItems = [];
        searchSelection.forEach((value, key) => {
          searchedItems.push(
            {name: value.getName(), id: value.getID()}
          )
        })
        
        if(ctx.onMenuRefresh) ctx.onMenuRefresh();
    }

    ContextManager.getInstance().addOnSelectedChanged(HighlightSelectPerson);
    
    setTimeout(() => {
      HighlightSelectPerson();
    }, 100)
    
      return (
        <div className="tree-index-container-content">
          <div>{getIndexPanel()}</div>
          <div>{getIndexList()}</div>
        </div>
      )
  };

  export default TreeIndexView;