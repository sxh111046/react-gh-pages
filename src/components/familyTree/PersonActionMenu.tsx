import React, { useState } from "react";
import DropDown from "../common/DropDown";
import TreeIndex from "../../utils/TreeIndex";
import ContextManager from "../../utils/ContextManager";
import Person from "../../utils/Person";
import { PersonActions }  from "../../types/MenuItems";
import SubtreeGenerator from "../../utils/SubtreeGenerator";

const PersonActionMenu: React.FC = (): JSX.Element => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const [, setSelectItem] = useState<string>("");
  const items = () => {
    return PersonActions;
  };

  const contextManager = ContextManager.getInstance();
  /**
   * Toggle the drop down menu
   */
  const toggleDropDown = () => {
    setShowDropDown(!showDropDown);
  };

  /**
   * Hide the drop down menu if click occurs
   * outside of the drop-down element.
   *
   * @param event  The mouse event
   */
  const dismissHandler = (event: React.FocusEvent<HTMLButtonElement>): void => {
    if (event.currentTarget === event.target) {
      setShowDropDown(false);
    }
  };

  /**
   * Callback function to consume the
   * item name from the child component
   *
   * @param item  The selected item
   */
  const itemSelection = (item: string): void => {
    switch (item) {
        case 'Ancestors Path': {
          const ctx = contextManager.getContext();
          const selectedPerson = ctx.selectedPerson as Person;
          let rootPerson = selectedPerson.getRootAncestor() as Person; // ctx.subtreeRoot as Person;
          if (!(rootPerson === selectedPerson) && selectedPerson.isLinked()) {
            contextManager.setSubtreeRoot(rootPerson);
            if (selectedPerson.isRelated(rootPerson)) {
              const subtreeGenerator = new SubtreeGenerator();
              subtreeGenerator.generateAncestorPath(rootPerson, selectedPerson);
            } 
          }
          if (rootPerson) ctx.subtreeRoot = rootPerson;
          const onIndexSelect = ctx.onIndexSelect;
          setTimeout(() => {
            if (onIndexSelect) onIndexSelect();
          }, 100)
          break;
        }
        case 'Decendents Path': {
          const ctx = contextManager.getContext();
          const selectedPerson = ctx.selectedPerson;
          
          if (selectedPerson?.hasChildren()) {
            ctx.subtreeRoot = selectedPerson;
            const onIndexSelect = ctx.onIndexSelect;
            setTimeout(() => {
              if (onIndexSelect) onIndexSelect();
            }, 100)
          }
          break;
        }
        case 'Root Tree': {
          const ctx = contextManager.getContext();
          const selectedPerson = ctx.selectedPerson as Person;
          const rootPerson = TreeIndex.getInstance().getRootPerson();
          contextManager.setSubtreeRoot(rootPerson);
          if (!selectedPerson.isRelated(rootPerson)) {
            ctx.selectedPerson = rootPerson;
          }
          
          const onIndexSelect = ctx.onIndexSelect;
          setTimeout(() => {
            if (onIndexSelect) onIndexSelect();
          }, 100)
          
          break;
        }
        case 'Collapse Main Branches': {
          const ctx = contextManager.getContext();
          const subtreeRoot = ctx.subtreeRoot as Person;
          const childrens = subtreeRoot.getChildren();
          ctx.selectedPerson = subtreeRoot;
          ctx.collapsedSubtrees = childrens;
          
          const onIndexSelect = ctx.onIndexSelect;
          setTimeout(() => {
            if (onIndexSelect) onIndexSelect();
          }, 100)
          
          break;
        }
        case 'Expand All': {
          const ctx = contextManager.getContext();
          ctx.collapsedSubtrees = [];
          
          const onIndexSelect = ctx.onIndexSelect;
          setTimeout(() => {
            if (onIndexSelect) onIndexSelect();
          }, 100)
          
          break;
        }
    }
    setSelectItem(item);
  };

  return (
    <>
      <button
        className={showDropDown ? "person-action-menu-active" : 'person-action-menu'}
        onClick={(): void => toggleDropDown()}
        onBlur={(e: React.FocusEvent<HTMLButtonElement>): void =>
          dismissHandler(e)
        }
      >
        <div>Layout Options</div>
        {showDropDown && (
          <DropDown
            items={items()}
            showDropDown={false}
            toggleDropDown={(): void => toggleDropDown()}
            itemSelection={itemSelection}
          />
        )}
      </button>
    </>
  );
};

export default PersonActionMenu;
