
import Family from '../utils/Family';

export interface PersonData {
    gen?: number;
    id?: string;
    firstName? : string;
    surname?: string;
    sex?: string;
    birthDate?: string;
    birthPlace?: string;
    deathDate?: string;
    deathPlace?: string;
    burialDate?: string;
    burialPlace?: string;
    pFamilyID?: string;
    sFamilyID?: string[];
    parentFamily?: Family;
    spouseFamily?: Family[];
    note?: string;
    history?: string;
    health?: string;
    religion?: string;
    occupation?: string;
    education?: string;
    decebdentCount?: number;
    lastUpdate?: Date;
    bookmark?: string;
}
