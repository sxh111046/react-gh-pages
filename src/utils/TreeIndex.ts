
import Person from '../utils/Person';
import { FamilyIndex } from '../types/FamilyIndex';
import { PersonIndex } from '../types/PersonIndex';
import ContextManager from './ContextManager';

class TreeIndex {

	private static instance: TreeIndex;

	private personIndex: Map<string, Person>;
	private familyIndex: FamilyIndex[];
	private rootPerson: Person = new Person();

    public constructor(pList: Map<string, Person>)
	{
		this.personIndex = pList;
		this.familyIndex = new Array<FamilyIndex>();
		TreeIndex.instance = this;
	}

	public static getInstance(): TreeIndex {
		return TreeIndex.instance;
	}

	public initialize() {
		this.personIndex.forEach((value: Person, key: string) => {
            this.addFamilyIndex(value);
        })
		// this.dumpFamilyIndex();
		this.familyIndex = this.sortFamilyIndex();
		ContextManager.getInstance().getContext().familyIndex = this.familyIndex;
		const rootId = ContextManager.getInstance().getContext().root; 
		this.rootPerson = this.getPerson(rootId as string) as Person;
	}

	addFamilyIndex(ix: Person)
	{
		let index: string = "";
		let fIndex: FamilyIndex = {};
		const surname = ix.getData().surname;
		if(!surname)
			index = "???";
		else
			index = surname;
		if (this.familyIndex.length > 0) {
			for(let i = 0; i< this.familyIndex.length; i++){
				fIndex = this.familyIndex[i];
				if (fIndex.index === index){
					if (!fIndex.links?.includes(ix))
						fIndex.links?.push(ix);
					return;
				} else {
					if (!this.isIndex(index)) {
						this.createIndex(ix, index);
						this.addFamilyIndex(ix);
					}
				}
			}
		} else {
			this.createIndex(ix, index);
			this.addFamilyIndex(ix);
		}
	}

	createIndex(ix: Person, index: string) {
		const fIndex = {index: index, bookmark: ix.getData().bookmark, links: new Array<Person>()};
		if (!this.familyIndex.includes(fIndex))
			this.familyIndex.push(fIndex);
	}

	isIndex(index: string): boolean {
		for (let i = 0; i < this.familyIndex.length; i++) {
			const fIndex = this.familyIndex[i];
			if (fIndex.index === index) {
				return true;
			}
		}
		return false;
	}

	dumpFamilyIndex() {
		this.familyIndex.forEach((value: FamilyIndex, index: number, array: FamilyIndex[]) => {
			const entry = {index: value.index, bookmark: value.bookmark, links: value.links};
			console.log(entry.index)
			entry.links?.forEach((p) => {
				console.log('    ' + p.getName());
			})
		})
	}

	sortFamilyIndex(): FamilyIndex[] {
		const indexList = new Array<FamilyIndex>();
		this.familyIndex.forEach((value: FamilyIndex, index: number, array: FamilyIndex[]) => {
			const entry = {index: value.index, bookmark: value.bookmark, links: value.links};
			indexList.push(entry);
		})
		indexList.sort((p1, p2) => {
			if((p1.index as string) > (p2.index as string))  {
				return 1;
			  } else if((p1.index as string) < (p2.index as string)) {
				return -1;
			  } else if (p1.index === p2.index) {
				return 0;
			  } else {
				return 1;
			  }
		});

		indexList.forEach((value: FamilyIndex, index: number, array: FamilyIndex[]) => {
			const entry = {index: value.index, bookmark: value.bookmark, links: value.links};
			entry.links = entry.links?.sort((p1, p2) => {
				if((p1.getName() as string) > (p2.getName() as string))  {
					return 1;
				  } else if((p1.getName() as string) < (p2.getName() as string)) {
					return -1;
				  } else if (p1.getID() === p2.getID()) {
					return 0;
				  } else {
					return 1;
				  }
			})
		})

		return indexList;
	}

	public getFamilyIndex(): FamilyIndex[] {
		return this.familyIndex;
	}

	public getPersonIndex(): PersonIndex[] {
		const nameList = new Array<PersonIndex>();
		this.personIndex.forEach((value: Person, key: string) => {
			const entry = {id: value.getData().id, name: value.getIndexName()};
			// ßconsole.log(entry.id + ' ' + entry.name);
			nameList.push(entry);
		})
		nameList.sort((p1, p2) => {
			if((p1.name as string) > (p2.name as string))  {
				return 1;
			  } else if((p1.name as string) < (p2.name as string)) {
				return -1;
			  } else if (p1.id === p2.id ) {
				return 0;
			  } else {
				return 1;
			  }
		});

		return nameList;
	}

	public getPerson(id: string): Person | undefined {
		let p = undefined;
		this.personIndex.forEach((value: Person, key: string) => {
			if (key === id) {
				p = value;
			}
		})
		return p;
	}

	public getRootPerson(): Person {
		if (!this.rootPerson.getID()) {
			const ctx = ContextManager.getInstance().getContext();
			this.rootPerson = this.getPerson(ctx.root as string) as Person;
		}
		return this.rootPerson;
	}

	public getSubtreeRoot(p: Person): Person | undefined {
		// console.log('subtree root: ' + p.getName());
		if (p.isRoot()) return p;
		const parent = p.getParent();
		if (parent) {
			if (this.isSubtree(parent)) {
				return parent;
			} else if (p.isOnPath(this.getRootPerson())){
				return this.getSubtreeRoot(parent);
			}
		}
		else if(this.pathExists(p)) {
			const sFamilies = p.getData().spouseFamily;
			if (sFamilies) {
				for (let i = 0; i < sFamilies.length; i++) {
					const sf = sFamilies[i];
					const spouse = sf.getSpouse(p);
					if (spouse) 
						return this.getSubtreeRoot(spouse);
				}
			}
		}
		else if(p.hasParentBranch()) {
			const fam = p.getAncestorFamily();
			const ctx = ContextManager.getInstance().getContext();
			const husband = fam?.getData().husband;
			if (husband) {
				ctx.subtreeRoot = husband;
          		ctx.selectedPerson = p;
				return husband;
			}
		}
		const rootId = ContextManager.getInstance().getContext().root;
		return this.getPerson(rootId as string);
	}

	pathExists(p: Person): boolean {
		const sFamilies = p.getData().spouseFamily;
		if (sFamilies) {
			for (let i = 0; i < sFamilies.length; i++) {
				const sf = sFamilies[i];
				const spouse = sf.getSpouse(p);
				if (spouse && spouse.getParent()) 
					return true;
			}
		}
		return false;
	}

	isSubtree(p: Person ): boolean {
		const ctx =  ContextManager.getInstance().getContext();
		const subtrees = ctx.subtrees as string[];
		// const rootId = ctx.subtreeRoot?.getID();
		const id = p.getID() as string;
		return (subtrees?.includes(id));	
	} 

	buildTrees(): Array<Person> {
		// const ctx =  ContextManager.getInstance().getContext();
		let treeRoots:Array<Person> = [];
		let rootID = '';
		this.personIndex.forEach((p, id)=> {
			if (!rootID) rootID = p.getID();
			if(!p.isLinked() && !p.isSpouseLink()) {
				treeRoots.push(p);
			}
		}) 
		let tempRoots:Array<Person> = [];
		treeRoots.forEach(p => {
			if(p.hasSpouseFamily()) {
				tempRoots.push(p);
			}
		})
		treeRoots = tempRoots;
		
		if (tempRoots.length > 1) {
			tempRoots = [];
			treeRoots.forEach((p) => {
				treeRoots.forEach(root => {
					if (p.isWifeOf(root)) {
						tempRoots.push(root);
					}
				})
			})
		}
		tempRoots.forEach(p => {
			// console.log(p.getName());
		})
		treeRoots = tempRoots;
		this.determineRootPerson(treeRoots, rootID);
		return treeRoots;
	}

	determineRootPerson(treeRoots: Person[], rootID: string) {
		treeRoots.sort((p1, p2) => {
			const p1CountHolder = p1.decendentscount();
			const p2CountHolder = p2.decendentscount();
			const p1Children = p1CountHolder.reduce((a, b) => a + b, 0);
			const p2Children = p2CountHolder.reduce((a, b) => a + b, 0);
			if (p1Children  > p2Children)  {
				return -1;
			  } else if (p1Children < p2Children) {
				return 1;
			  } else if (p1Children === p2Children) {
				return 0;
			  } else {
				return -1;
			  }
		});
		const ctx = ContextManager.getInstance().getContext();
		if (treeRoots.length > 0) {
			ctx.root = treeRoots[0].getID();
		}  else {
			ctx.root = rootID;
		}
	}

	setNewSubtree(pID: string, indexSelection?: boolean) {
		const ctx = ContextManager.getInstance().getContext();
		const subtreeRootID = ctx.subtreeRoot?.getID();
		const treeIndex = TreeIndex.getInstance();
		const selectedPerson = treeIndex.getPerson(pID) as Person;
		const rootPerson = treeIndex.getRootPerson();
		const isSpouse = selectedPerson.isSpouse(rootPerson);
		const isRelated = selectedPerson.isRelated(rootPerson) || 
			selectedPerson.getRelatedSpouse(ctx.subtreeRoot as Person) !== undefined;
		if (isSpouse && selectedPerson.hasParentBranch()) {
		  const ancestorFamily = selectedPerson.getAncestorFamily();
		  const husband = ancestorFamily?.getData().husband;
		  if (husband) ctx.subtreeRoot = ancestorFamily?.getData().husband;
		  ctx.selectedPerson = selectedPerson;
		}
		else if (pID !== subtreeRootID && isRelated && !indexSelection ) {
		  if (!selectedPerson.hasChildren()) {
			ctx.selectedPerson = selectedPerson;
		  } else {
			ctx.subtreeRoot = selectedPerson;
			ctx.selectedPerson = ctx.subtreeRoot;
		  }
		} else {
			ContextManager.getInstance().setSeletedPerson(selectedPerson);
			const treeRoot = selectedPerson.getRootAncestor(true);
			if (treeRoot) {
				ContextManager.getInstance().setSubtreeRoot(treeRoot);
			} else {
		  		ContextManager.getInstance().setSubtreeRoot(TreeIndex.getInstance().getSubtreeRoot(selectedPerson) as Person);
			}
		}
	}
}
export default TreeIndex;