import React from 'react';
import ReactDOM from 'react-dom/client';
import ContextManager from './utils/ContextManager';
import { GEDContext } from './types/GEDContext';
import FamilyTreeView from './components/familyTree/FamilyTreeView';
import GEDFileGetter from './components/familyTree/GEDFileGetter';

  function App() {
    const params = ContextManager.getInstance().getContext();
    const keyStore = localStorage.getItem('keyStore');
    let ctx: GEDContext = {stateCounter: 0, onSelect: alert};

    if (keyStore) {
      localStorage.setItem('keyStore', '');
      const ctx = JSON.parse(localStorage.getItem(keyStore) as string);
      ContextManager.getInstance().setContext(ctx);
      if (ctx.onSelect) ctx.onSelect();
    } 

    return (
      <>
         <GEDFileGetter { ...params}/>
         keyStore && <FamilyTreeView { ...ctx}/>
         !keyStore && <GEDFileGetter { ...params}/>
      </>
    )
  }


export default App
