import React from 'react';
import ContextManager from './utils/ContextManager';
import FamilyTreeView from './components/familyTree/FamilyTreeView';
import GEDFileGetter from './components/familyTree/GEDFileGetter';

  function App() {
    const params = ContextManager.getInstance().getContext();
    const keyStore = localStorage.getItem('keyStore');

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
