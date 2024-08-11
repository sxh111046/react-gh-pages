import React, {Children, useContext, useState, useMemo, useEffect} from 'react';
import Person from '../utils/Person';
import { FamilyIndex } from './FamilyIndex';
import { PersonIndex } from './PersonIndex';
import { Header } from './Header';

export interface GEDContext {
    gedFileName?: string;
    fileContent?: string;
    header?: Header;
    root?: string;
    subtrees?: string[];
    treeRoots?: Person[];
    familyIndex?: FamilyIndex[];
    personIndex?: PersonIndex[];
    connectors?: Map<string, string[]>;
    subtreeRoot?: Person;
    selectedPerson?: Person;
    collapsedSubtrees?: Person[];
    onSelect: () => void;
    onIndexSelect?: () => void;
    onFocusNode?: () => void;
    onMenuRefresh?: () => void;
    onPersonSelectedChanged?: Array<() => void>;
    stateCounter: number;
    genSpacing?: number;
    initialized?: boolean;
}
export const gedContext = React.createContext<GEDContext>;
