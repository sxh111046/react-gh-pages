import React from 'react';
import ReactDOM from 'react-dom/client';
import ContextManager from './utils/ContextManager';
import FamilyTreeView from './components/familyTree/FamilyTreeView';
import GEDFileGetter from './components/familyTree/GEDFileGetter';

  function App() {
    const params = ContextManager.getInstance().getContext();
    const keyStore = localStorage.getItem('keyStore');

    if (keyStore) {
      localStorage.setItem('keyStore', '');
      const ctx = JSON.parse(localStorage.getItem(keyStore) as string);
      ContextManager.getInstance().setContext(ctx);
      if (ctx.onSelect) ctx.onSelect();
    } 

    return (
      <>
         <GEDFileGetter { ...params}/>
         keyStore && <GEDFileGetter { ...params}/>
         !keyStore && <GEDFileGetter { ...params}/>
      </>
    )
  }


export default App
