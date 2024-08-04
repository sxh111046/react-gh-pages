import React, {useState} from 'react';
import Popup from 'reactjs-popup';
import { MenuItem } from '../../types/MenuItem';
    
export interface PopupMemuProps {
    menuItems: MenuItem[];
}

function PopupMenu(props: PopupMemuProps) {

    function getWholeMenu(): JSX.Element[] {
        const elements = new Array<JSX.Element>();
        props.menuItems.forEach((item) => {
            elements.push(getMenuItem(item));
        })
        return elements;
    }

    function getMenuItem(item: MenuItem): JSX.Element {
        return (
            <div>
                <Popup
                    trigger={<div className="menu-item"> Sub menu </div>}
                    position="right top"
                    on="hover"
                    closeOnDocumentClick
                    mouseLeaveDelay={300}
                    mouseEnterDelay={0}
                    contentStyle={{ padding: '0px', border: 'none' }}
                    arrow={false}
                    >
                    <div className={item.className || 'menu-item'}
                        onClick={item.callback}>
                        {item.name}
                        {item.subitems && getSubitems(item)}
                    </div>
                </Popup>
            </div> 
        )
    }

    function getSubitems(item: MenuItem): JSX.Element {
        return (
            <Popup
                trigger={<div className="menu-item"> Sub menu </div>}
                position="right top"
                on="hover"
                closeOnDocumentClick
                mouseLeaveDelay={300}
                mouseEnterDelay={0}
                contentStyle={{ padding: '0px', border: 'none' }}
                arrow={false}
            >
                <div className="menu">
                {getItemSubItems(item.subitems)}
                </div>
            </Popup>
        )
    }

    function getItemSubItems(items?: MenuItem[]): Array<JSX.Element> {
        const elements = new Array<JSX.Element>();
        items?.forEach((item) => {
            elements.push(getMenuItem(item));
        })
        return elements;
    }

    return (
        <div>
            {getWholeMenu()} 
        </div>
    )
};
  
  export default PopupMenu;

  /*
  <div className="menu">
        <div className="menu-item"> Menu item 1</div>
        <div className="menu-item"> Menu item 2</div>
        <div className="menu-item"> Menu item 3</div>
        <Popup
            trigger={<div className="menu-item"> Sub menu </div>}
            position="right top"
            on="hover"
            closeOnDocumentClick
            mouseLeaveDelay={300}
            mouseEnterDelay={0}
            contentStyle={{ padding: '0px', border: 'none' }}
            arrow={false}
        >
            <div className="menu">
            <div className="menu-item"> item 1</div>
            <div className="menu-item"> item 2</div>
            <div className="menu-item"> item 3</div>
            </div>
        </Popup>
        <div className="menu-item"> Menu item 4</div>
        </div>
        */