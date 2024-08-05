import React, {useState} from 'react';
import {GEDContext} from '../../types/GEDContext';
import ContextManager  from '../../utils/ContextManager';

const panelStyle = {
    color: '#777',
    fontSize: 12,
    };

    const buttonStyle = {
    fontSize: 12,
    marginRight: 5,
    marginTop: 5,
    };

function GEDFileGetter(params: GEDContext) {

    const [, setInitialized] = useState(false);

     const ctxManager = ContextManager.getInstance();

     // const isInitialized = localStorage.getItem("initTree") === 'true';

     const keyStore = 'familyTree';

    function openGedFile() {
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.click();
    }

    function launchFamilyTree() {
        localStorage.setItem('keyStore', keyStore);
        window.open(window.location.href + 'index.html', '_self');
    }

    function handleChange (selectorFiles: FileList)
    {
      const file = selectorFiles.item(0);
      if (file) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
        const fileContent = fileReader.result as string;
        ctxManager.initContext();
        ctxManager.setGEDFileName(file.name);
        ctxManager.setFileContent(fileContent);
        ctxManager.setInitialized(true);
        ctxManager.setRoot('1');
        const params = ctxManager.getContext();
        setInitialized(true);
        localStorage.setItem(keyStore, JSON.stringify(params));
        launchFamilyTree();
        };
        fileReader.readAsText(file);
      }
    }

    return (
        <>
            <div>
                <input hidden id="fileInput" type="file" onChange={ (e) => handleChange(e.target.files as FileList) } />
            </div>
            <div id="openGedFile" className="ged-buttons-bar-container" style={panelStyle}>
                <button className="ged=button-getter" onClick={openGedFile} style={buttonStyle}>
                Open GED File
                </button>
            </div>
        </>
    );
}
export default GEDFileGetter