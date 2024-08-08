import FamilyTreeParser from "./FamilyTreeParser";
import Family from '../utils/Family';
import {PersonData} from '../types/PersonData';
import ContextManager from "./ContextManager";

class Person {
    private familyTree?: FamilyTreeParser;
    private personData: PersonData = {};
    private ctxManager: ContextManager = ContextManager.getInstance();

    constructor (ft?: FamilyTreeParser)
    {
        this.familyTree = ft;
        this.personData.gen = 0;
        this.personData.decebdentCount = -1;
        this.personData.sFamilyID = new Array<string>();
        this.personData.spouseFamily = new Array<Family>();
    }

    public setGenNumber(genNumber: number)
    {
        this.personData.gen = genNumber + 1;

        const spouseFamily = this.personData.spouseFamily;
        if (spouseFamily) {
            if (this.isLinked() || this.isRoot())	{
                for(let i=0; i < spouseFamily.length; i++) {
                    if (spouseFamily[i]) {
                        const spouse = spouseFamily[i].getSpouse(this);
                        if (spouse != null && spouse.getData().gen === 0)
                            spouse.getData().gen = this.personData.gen;
                        for(let j=0; j < spouseFamily[i].childCount(); j++){
                            const child = spouseFamily[i].getChildAt(j);
                            if (child) child.setGenNumber(this.personData.gen);
                        }
                    }
                    else break;
                } 
            }	
        } 
    }

    public isRoot(): boolean
    {
        const rootId = this.ctxManager.getContext().root
        return (this.personData.id === rootId);
    }

    public isLinked(): boolean
    {
        return (this.personData.parentFamily !== undefined);
    }

    public isSpouseLink(): boolean {
        for (let i = 0; i < this.spouseCount(); i++) {
            const spouse = this.getSpouse(i);
            if (spouse?.isLinked()) {
                return true;
            }
        }
        return false;
    }

    public isRelated(rootPerson: Person): Boolean {
        if (rootPerson && this.isLinked()) {
            const pFamily = this.personData.parentFamily;
            if (pFamily) {
                const wife = pFamily.getData().wife;
                const husband = pFamily.getData().husband;
                if (wife && wife.getID() === rootPerson.getID()) {
                    return true;
                } else if (husband &&  husband.getID() === rootPerson.getID()) {
                    return true;
                }
                else if (wife && wife.isRelated(rootPerson)) {
                    return true;
                } else if (husband) {
                    return husband.isRelated(rootPerson);
                }
            }
        } 
        return false;
    }

    public getRelatedSpouse(rootPerson: Person): Person | undefined {
        for (let i = 0; i < this.spouseCount(); i++) {
            const spouse = this.getSpouse(i);
            if (spouse?.isRelated(rootPerson)) {
                return spouse;
            }
        }
        return undefined;
    }

    public getAncestorChain(rootPerson: Person, ancChain?: Person[]): Person[] {
        if(!ancChain) ancChain = new Array<Person>();
        if(this.isRelated(rootPerson)) {
            const pFamily = this.personData.parentFamily;
            if (pFamily) {
                const wife = pFamily.getData().wife;
                const husband = pFamily.getData().husband;
                if (wife?.getID() === rootPerson.getID() || husband?.getID() === rootPerson.getID()) {
                    ancChain.push(rootPerson as Person);
                }
                else if (wife && wife.isRelated(rootPerson)) {
                    ancChain.push(wife);
                    wife.getAncestorChain(rootPerson, ancChain);
                } else if (husband) {
                    ancChain.push(husband);
                    husband.getAncestorChain(rootPerson, ancChain);
                }
            } 
        }
        return ancChain;
    }
    
    public getAncestorFamily(fam?: Family, famChain?: Family[]): Family | undefined {
        if (!famChain) famChain = new Array<Family>();
        const pFamily = this.personData.parentFamily;
        if (pFamily) {
            const wife = pFamily.getData().wife;
            const husband = pFamily.getData().husband;
            famChain.push(pFamily);
            if (wife && wife.getData().parentFamily) {
                return wife.getAncestorFamily(wife.getData().parentFamily);
            } else if (husband && husband?.getData().parentFamily) {
                return husband.getAncestorFamily(husband?.getData().parentFamily);
            }
        }
        if (famChain.length > 0) {
            return famChain.pop();
        } else {
            return undefined;
        }
    }

    public getSpouse(famNum: number):Person | undefined
    {
        const sFam = this.getSpouseFamily(famNum);
        if (sFam)
            return sFam.getSpouse(this);
        else
            return undefined;
    }

    public getSpouseFamily(sp:number):Family | undefined
    {
        if (this.personData.spouseFamily)
            return this.personData.spouseFamily[sp];
        else
            return undefined;
    }

    public getData(): PersonData {
        return this.personData;
    }

    public setData(data: PersonData) {
        this.personData = data;
        if (!this.personData.firstName) this.personData.firstName = '?';
        if (!this.personData.surname) this.personData.surname = '?';
    }

    public getGen(): number {
        if (this.personData.gen)
            return this.personData.gen;
        else
            return 0;
    }

    public setGen(gen: number) {
        this.personData.gen = gen;
    }

    parseName(name: string)
	{
		const st:string[] = name.split("/");

		for (let i = 0; i < st.length; i++) {
			if (i === 0) this.personData.firstName = st[i];
            if (i === 1) this.personData.surname = st[i];
		}	
	}

    public getName(): string
    {
        return this.personData.firstName + " " + this.personData.surname;
    }

    public getID(): string {
        return this.personData.id as string;
    }

    public isLastChild(): boolean {
        const fam = this.personData.parentFamily;
        if (fam) {
            const child = fam.getChildAt(fam.childCount() - 1);
            return this.getID() === child?.getID();
        }
        return false;
    }

    public isTopPerson(): boolean {
        const ctx =  ContextManager.getInstance().getContext();
        const id = this.getID() as string;
        const isRootSpouse = ctx.subtreeRoot?.getSpouse(0)?.getID() === id;
        return (id === ctx.subtreeRoot?.getID() && id !== ctx.root) || isRootSpouse;
    }

    public isSubtree(): boolean {
        const ctx =  ContextManager.getInstance().getContext();
		const subtrees = ctx.subtrees as string[];
		const rootId = ctx.subtreeRoot?.getID();
		const id = this.getID() as string;
		return (subtrees?.includes(id) && !(id === rootId)) 	
    }

    public getIndexName(): string
    {
        return this.personData.surname + ", " + this.personData.firstName;
    }

    public getParent(root?: Person): Person | undefined
    {
        if (this.personData.parentFamily)
            return this.personData.parentFamily.getLink(root);
        else
            return undefined;
    }

    public isOnPath(root: Person): boolean
    {
        const parentFamily = this.personData.parentFamily;
        if (parentFamily) {
            let id = parentFamily.getData().wife?.getData().id;
            if (id === root.getData().id)
                return true;
            else {
                id = parentFamily.getData().husband?.getData().id;
                if (id === root.getData().id)
                    return true;
            }
            const wife = parentFamily.getData().wife;
            if (wife && wife.isOnPath(root)) 
                return true;
            const husband = parentFamily.getData().husband;   
            if (husband)
                return husband.isOnPath(root);
        }
        return false;
    }

    public getBirthYear(): string
    {
        const birthDate = this.getData().birthDate;
        if (!birthDate)
            return "";
        else if (birthDate.length < 4)
            return "";
                    
        return birthDate.substring(birthDate.length - 4, birthDate.length );
    }

    public getDeathYear(): string
    {
        const deathDate = this.getData().deathDate;
        if (!deathDate)
            return "";
        else if (deathDate.length < 4)
            return "";
                    
        return deathDate.substring(deathDate.length - 4, deathDate.length );
    }

    public isSpouse(root: Person): boolean
    {
        return !this.isOnPath(root);
    }

    public hasParentBranch(): boolean
    {
        return this.getData().parentFamily !== undefined
    }

    public isWifeOf(p: Person): boolean {
        const families = this.getData().spouseFamily as Family[];
        for (let i = 0; i < families.length; i++) {
            const fam = families[i];
            if(p.getID() === fam.getData().husband?.getID()) {
                return true;
            }
        }
        return false;
    }

    public isHusbandOf(p: Person): boolean {
        const families = this.getData().spouseFamily as Family[];
        for (let i = 0; i < families.length; i++) {
            const fam = families[i];
            if(p.getID() === fam.getData().wife?.getID()) {
                return true;
            }
        }
        return false;
    }

    public hasSpouseFamily(): boolean {
        const spouseFamily = this.getData().spouseFamily as Family[];
        return spouseFamily.length > 0;
    }

    public hasChildren(): boolean {
        for (let i = 0; i < this.spouseCount(); i++) {
            const fam = this.getSpouseFamily(i);
            const childCount = fam?.childCount() as number;
            if (childCount > 0) return true;
        }
        return false;
    }

    public getChildren(): Person[] {
        let children: Person[] = [];
        for (let i = 0; i < this.spouseCount(); i++) {
            const fam = this.getSpouseFamily(i);
            children = children.concat(fam?.getData().children as Person[])
        }
        return children;
    }

    public decendentscount(childNodes?: Array<number>): Array<number> {
        if (!childNodes) {
            childNodes = new Array<number>();
            const dc = this.getData().decebdentCount;
            if (dc && dc  >= 0) {
                childNodes.push(dc);
                return childNodes;
            }
        }
        const children = this.getChildren();
        childNodes.push(children.length);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            console.log("     dec child: " + child.getName());
            if (child.hasChildren()) {
                child.countChildren(childNodes);
            } 
        }
        let dc = childNodes.reduce((a, b) => a + b, 0);
        if (!dc) dc = 0;
        this.getData().decebdentCount = dc
        return childNodes;
    }
          
    private countChildren(childNodes: Array<number>): Array<number> {
        childNodes.push(this.getChildren().length);
        return this.decendentscount(childNodes);
    }   

    public spouseCount(): number
    {
        let count = 0;
        const spouseFamily = this.getData().spouseFamily as Family[];
        for (let i=0; i < spouseFamily.length; i++){
            if (spouseFamily[i] != null)
                count++;
            else
                break;
        }
        return count;
    }

    public getFamilies(): Family[] {
        const families = new Array<Family>();
        for (let i = 0; i < this.spouseCount(); i++) {
            const fam = this.getSpouseFamily(i);
            if (fam) families.push(fam);
        }
        return families;
    }

    public getRootAncestor(includeSpouse?: boolean): Person | undefined{
        const ctx = ContextManager.getInstance().getContext();
        const roots = ctx.treeRoots as Person[];
        for (let i = 0; i < roots.length; i++) {
            const root = roots[i];
            let condition = this.isRelated(root) || this.isWifeOf(root);
            if (includeSpouse) {
                condition = (this.getRelatedSpouse(root) !== undefined) || condition;
            }
            if (condition) {
                return root;
            }
        }
        return undefined;
    }

}
export default Person;