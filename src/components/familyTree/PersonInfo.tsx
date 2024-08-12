import React, {useState} from 'react';
import ContextManager from '../../utils/ContextManager';
import { PersonData } from '../../types/PersonData';
import PersonActionMenu from './PersonActionMenu';

function PersonInfo() {

    const ctx = ContextManager.getInstance().getContext();
    ContextManager.getInstance().addOnSelectedChanged(onPersonChange);
    
    const selectedPerson = ctx.selectedPerson;

    const [, setStateCounter] = useState(0);
    const [showPanel, setShowPanel] = useState(true);

    function onPersonChange() {
        ContextManager.getInstance().upStateCounter();
        const ctx = ContextManager.getInstance().getContext();
        setStateCounter(ctx.stateCounter as number);
    }

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

    function getNoteLine(note: string): JSX.Element {
		const c = "'";
		let nt = "";
		note = note.replace(c.charAt(0), '^');

		note = note.replace('\r', ' ');
		note = note.replace('\t', ' ');
		note = note.replace('"', '`');
		const st: string[] = note.split('\n');
		for (let i = 0; i < st.length; i++) {
            nt+= " " + st[i].trim();
        }
        nt = nt.replace(/<p>/g, '');
        nt = nt.replace(/<\/p>/g, '');
		nt.trim();
		return <div>{note}</div>;
	}

    function getInfoLine(title: string, content: any): JSX.Element {
        return  (<tr>
                    <td className="person-info-title">{title}</td>
                    <td className="person-info-value">{content}</td>
                </tr>)
    }

    function getPersonInfoSection(data: PersonData): JSX.Element {
        return (
            <table className='person-info-holder'>
                <tbody>
                    {getInfoLine('First Name:', data.firstName)}
                    {getInfoLine('Last Name:', data.surname)}
                    {getInfoLine('Birth:', data.birthDate)}
                    {data.deathDate && getInfoLine('Death:', data.deathDate)}
                    {getInfoLine('Birth Place:', data.birthPlace)}
                    {data.note && getInfoLine('Note:', getNoteLine(data.note))}
                </tbody>
            </table>
        )      
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
                    {getPersonInfoSection(data)}
                </div>}
            </div>
        </div>
        )
    } else {
        return (<div></div>);
    }
}

export default PersonInfo