
import {FamilyData} from '../types/FamilyData';
// import {PersonData} from '../types/PersonData';
import Person from './Person';

class Family {

    private familyData: FamilyData;

    constructor ()
    {
        this.familyData = {};
        this.familyData.id = '';
        this.familyData.husband = undefined;
        this.familyData.wife = undefined;
        this.familyData.children = new Array<Person>();
    }

    public getData(): FamilyData {
        return this.familyData;
    }
    
    public getSpouse(p:Person): Person | undefined
    {
        if (this.familyData.husband?.getData().id === p.getData().id) {
            return this.familyData.wife;
        }
        else if (this.familyData.wife?.getData().id === p.getData().id) {
            return this.familyData.husband;       
        }
        else
            return undefined;
    }

    public childCount(): number
    {
        if (this.familyData.children) {
            return this.familyData.children?.length;
        }
        return 0;
    }

    public getChildAt(pos: number): Person | undefined
    {
        if (this.familyData.children) {
            return this.familyData.children[pos];
        }
        return undefined
    }

    public getLink(root?: Person ): Person | undefined
    {
        if (root) {
            const wife = this.familyData.wife;
            if (wife && wife.getData().pFamilyID) {
                    if (wife.isOnPath(root))
                        return wife;
            }
            const husband = this.familyData.husband;
            if (husband && husband.getData().pFamilyID) {
                    if (husband.isOnPath(root))
                        return husband;
            }
        } else {
            const wife = this.getData().wife;
            if (wife)
                {
                    if (wife.getData().pFamilyID)
                        return wife;
                    else
                        return this.getData().husband;
                }
                else
                    return this.getData().husband;
        }
        return undefined;
    }

    public getChildrenFamilies(): Family[] {
        const cFamilies = new Array<Family>();
        for (let i = 0; i < this.childCount(); i++) {
            const child = this.getChildAt(i);
            const fams = child?.getFamilies();
            fams?.forEach(element => {
                cFamilies.push(element);  
            });
        }
        return cFamilies;
    }
}

export default Family;