import React, { useEffect, useState } from 'react';

type DropDownProps = {
  items: string[];
  showDropDown: boolean;
  toggleDropDown: Function;
  itemSelection: Function;
};

const DropDown: React.FC<DropDownProps> = ({
  items,
  itemSelection,
}: DropDownProps): JSX.Element => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);

  /**
   * Handle passing the item name
   * back to the parent component
   *
   * @param item  The selected city
   */
  const onClickHandler = (item: string): void => {
    itemSelection(item);
  };

  useEffect(() => {
    setShowDropDown(showDropDown);
  }, [showDropDown]);

  return (
    <>
      <div className={showDropDown ? 'dropdown' : 'dropdown active'}>
        {items.map(
          (item: string, index: number): JSX.Element => {
            return (
              <p className="dropdown-item"
                key={index}
                onClick={(): void => {
                  onClickHandler(item);
                }}
              >
                {item}
              </p>
            );
          }
        )}
      </div>
    </>
  );
};

export default DropDown;