import Person from '../utils/Person';

export interface FamilyData {
    id?: string;
    husband?: Person;
    wife?: Person;
    children?: Person[];
}