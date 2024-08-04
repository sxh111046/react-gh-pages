import React, { useState } from "react";
import ContextManager from "../../utils/ContextManager";
import { MenuItem } from "../../types/MenuItem";
import Select from "react-dropdown-select";
import '../../styles/modal.css';
import TreeIndex from "../../utils/TreeIndex";
import Person from "../../utils/Person";

export interface SelectionMenuProps {
  items: MenuItem[];
  onGetItems: () => MenuItem[];
  onPersonSelection: (p: Person) => void
}

interface Option {
    id?: string;
    name: string;
    style?: string;
}

function PersonSelectionMenu(props: SelectionMenuProps): JSX.Element {
  const ctx = ContextManager.getInstance().getContext();
  ctx.onMenuRefresh = refresh;
  let mItems = props.items;
  const [open, setOpen] = useState(false);

  function refresh() {
    setTimeout(() => {
      getMenuItems();
      setOpen(true);
    }, 200)
  }

  function onClose() {
    setOpen(false);
  }

  function getMenuItems(): Option[] {
    const elements = new Array<Option>();
    mItems = props.onGetItems();
    mItems.forEach((value, key) => {
        const option: Option = {id:value.id, name: value.name};
        elements.push(option);
    })
    return elements
  }

  function setValues(options: Option[]) {
    const id = options[0].id;
    const p = TreeIndex.getInstance().getPerson(id as string) as Person;
    if (options && options.length > 0) {
      setOpen(false);
      props.onPersonSelection(p);
    }
  }
  
  return (
      <div className="person-selection-menu-container">
        {open && <Select
            options={getMenuItems()}
            values={[]}
            className="person-selection-menu"
            labelField="name"
            valueField="id"
            onChange={(values) => setValues(values)}
            onDropdownClose={onClose}
            placeholder={'Select...'}
            autoFocus={true}
            dropdownGap={2}
        >
        </Select>}
    </div>
    
  );
};

export default PersonSelectionMenu;
