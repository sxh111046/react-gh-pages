import React, {useState} from 'react';
import ContextManager from '../../utils/ContextManager';
import PersonActionMenu from './PersonActionMenu';
import PersonInfoContent from './PersonInfoContent';

function PersonInfo() {

    const ctx = ContextManager.getInstance().getContext();
    
    const selectedPerson = ctx.selectedPerson;

    const [showPanel, setShowPanel] = useState(true);

    function openPanel() {
        const personInfo = document.getElementById('personInfoContainer');
        if (personInfo) {
            personInfo.classList.add('person-info-container-expaned');
            personInfo.classList.remove('person-info-container-collapse');
        }
        setShowPanel(true);
    }

    function closePanel() {
        const personInfo = document.getElementById('personInfoContainer');
        if (personInfo) {
            personInfo.classList.remove('person-info-container-expaned');
            personInfo.classList.add('person-info-container-collapse');
        }
        setShowPanel(false);
    }

    const data = selectedPerson?.getData();
    if (data && data?.id) {
        return (
        <div className="person-info-container-content">
            <div className="person-info-panel-buttons">
                <div>
                    {showPanel &&  <img id="hideImage" alt=' ' className="person-info-hide-image" onClick={closePanel}/> }
                    {showPanel && <PersonActionMenu />}
                    {!showPanel &&  <img id="showImage" className="person-info-show-image" onClick={openPanel}/> }
                </div>
            </div>
            
            <div className='person-info'>
                {showPanel && <div className='person-info-content'>
                    <PersonInfoContent />
                </div>}
            </div>
        </div>
        )
    } else {
        return (<div></div>);
    }
}

export default PersonInfo