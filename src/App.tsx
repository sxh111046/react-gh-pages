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

    // localStorage.setItem('keyStore', '');

    if (keyStore) {
      setTimeout(() => {
        localStorage.setItem('keyStore', '');
      }, 2000);
      const ctx = JSON.parse(localStorage.getItem(keyStore) as string);
      ContextManager.getInstance().setContext(ctx);
      if (ctx.onSelect) ctx.onSelect();
      return (
        <FamilyTreeView { ...ctx}/>
      )
    } else {
      return (
        <GEDFileGetter { ...params}/>
      )
    }
  }


export default App
