import React, {useState} from 'react';
import {GEDContext} from '../../types/GEDContext';
import ContextManager  from '../../utils/ContextManager';
import '../../styles/FamilyTreeView.css'

const panelStyle = {
    color: '#777',
    fontSize: 12,
    };

function GEDFileGetter(params: GEDContext) {

    const [, setInitialized] = useState(false);

     const ctxManager = ContextManager.getInstance();

     const keyStore = 'familyTree';

    function openGedFile() {
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.click();
    }

    function launchFamilyTree() {
        localStorage.setItem('keyStore', keyStore);
        let url = window.location.origin + window.location.pathname;
        if (!url.includes('index.html')) {
            url += 'index.html';
        }
        window.open(url, '_self');
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
            <div className="ged-buttons-bar-container">
                <div id="openGedFile" className="ged-buttons-bar" style={panelStyle}>
                    <button className="button-style" onClick={openGedFile} >
                    Open GED File
                    </button>
                </div>
                <div className="ged-file-desc">
                    {ctxManager.getContext().header?.gedFile}
                </div>
            </div>
        </>
    );
}
export default GEDFileGetter