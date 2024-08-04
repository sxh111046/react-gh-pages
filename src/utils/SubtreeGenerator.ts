
import ContextManager from './ContextManager';
import {PersonViewProps} from '../components/familyTree/PersonView';
import Person from './Person';
import TreeIndex from './TreeIndex';

class SubtreeGenerator {

    private ancestor: boolean[] = new Array<boolean>(24);
    private firstGen = 0;
    private ctx = ContextManager.getInstance().getContext();
    private connectors = new Map<string, string[]>();
    private subtreeNodes = new Array<PersonViewProps>();

    private resetAncestors() {
      for(let i = 2; i < this.ancestor.length; i++)
        this.ancestor[i] = false;
    }


    public generate(p: Person): PersonViewProps[] {
      this.resetAncestors();
      this.setAncestors(p);
      
      const type = (p.getGen() > 0) ? 'child' : 'person ';

      this.addFromConnectorEntry(p.getID());

      if (p.isSubtree()) {
        this.subtreeNodes.push(this.addSubtreeEntry(p, 'person'));
        return this.subtreeNodes;
      }
      if (p.isTopPerson()) {
        this.subtreeNodes.push(this.addSubtreeEntry(p, type));
      } else {
        this.subtreeNodes.push(this.addPersonEntry(p, type));
      }
      if (!this.ctx.collapsedSubtrees?.includes(p)) {
        for (let sp = 0; sp < p.spouseCount(); sp++) {
          const spouse = p.getSpouse(sp);
          if (spouse) {
            spouse.setGen(p.getGen());
            this.subtreeNodes.push(this.addPersonEntry(spouse, 'spouse'));
            const fam = p.getSpouseFamily(sp);

            if (fam) {
              for (let i = 0; i < fam.childCount(); i++){
                const child = fam.getChildAt(i);
                if (child) {
                  this.addToConnectorEntry(p.getID(), child.getID());
                  this.addFromConnectorEntry(spouse.getID());
                  this.addToConnectorEntry(spouse.getID(), child.getID());
                  child.setGen(p.getGen() + 2);
                  this.generate(child);
                }
              }
            }
          }
        }
      }
      this.ctx.connectors = this.connectors;
      return this.subtreeNodes;
    }

    public generateAncestorPath(rootPerson: Person, p: Person) {
  
      const ancestorPath = this.getAncestorPath(rootPerson, p);
      ancestorPath.reverse();
      const collapseBranches = new Array<Person>();
      
      for (let i = 0; i < ancestorPath.length - 1; i++) {
        const child = ancestorPath[i];
        const childrens = child.getChildren();
        childrens.forEach(value => {
          if (!ancestorPath.includes(value)) {
            collapseBranches.push(value);
          }
        })
      }
      const ctx = ContextManager.getInstance().getContext();
      ctx.collapsedSubtrees = collapseBranches;
      
    }

    public expandHiddenBranches(p: Person): boolean {
      const ctx = ContextManager.getInstance().getContext();
      const subtreeRoot = ctx.subtreeRoot as Person;
      const isRelated = p.isRelated(subtreeRoot);
      if (isRelated) {
        return this.removeCollapesBrances(p);
      } else {
        const spouse = p.getRelatedSpouse(subtreeRoot);
        if (spouse) {
          return this.removeCollapesBrances(spouse);
        }
      }
      return false;
    }

    private removeCollapesBrances(p: Person): boolean {
      let hidden = false;
      const ctx = ContextManager.getInstance().getContext();
      const ancestors = p.getAncestorChain(ctx.subtreeRoot as Person);
      if (ancestors && ancestors.length > 0) {
        ancestors.push(p);
        ancestors.forEach(person => {
          if(ctx.collapsedSubtrees && ctx.collapsedSubtrees.includes(person)) {
            const index = ctx.collapsedSubtrees.indexOf(person);
            ctx.collapsedSubtrees.splice(index, 1);
            hidden = true;
          }
        })
      }
      return hidden;
    }

    public getConnectors(): Map<string, string[]> {
        return this.connectors;
    }

    private addPersonEntry(p: Person, type: string): PersonViewProps {
      const pvProps: PersonViewProps = {person: p as Person, type: type, gen: p.getGen()};
      return pvProps;
    }

    private addSubtreeEntry(p: Person, type: string): PersonViewProps {
      const pvProps: PersonViewProps = {person: p as Person, type: type, gen: p.getGen(), hyperlink: true};
      return pvProps;
    }

    private setAncestors(p: Person) {
      const gen = p.getData().gen as number;
 
      if (gen === this.firstGen) {
        this.ancestor[gen] = true;
        return;
      }
      let lastGen = false;
      if (gen > 0)
       this.ancestor[gen-1] = true;
      if(p.isLastChild()){
        this.ancestor[gen -1] = false;
        if (gen === this.firstGen + 1)
          lastGen = true;		 
      }
      if(!lastGen){
       const parent = p.getParent(TreeIndex.getInstance().getRootPerson());
       if (parent)
         this.setAncestors(parent);
      }
    }

    private addFromConnectorEntry(pID: string) {
      if (!this.connectors.has(pID)) {
        this.connectors.set(pID, []);
      }
    }

    private addToConnectorEntry(fromID: string, toID: string) {
      if (this.connectors.has(fromID)) {
        const toConnectors = this.connectors.get(fromID);
        toConnectors?.push(toID);
      }
    }
    
    public getAncestorPath(rootPerson: Person, p: Person, connPath?: Array<Person>): Person[] {
      const treeIndex = TreeIndex.getInstance();
      if(!connPath) {
        connPath = new Array<Person>();
        connPath.push(p);
      }
      const connectors = this.ctx.connectors;
      let parentKey = '';

      connectors?.forEach((value: string[], key: string) => {
        if (p && value.includes(p.getID())) {
          const parent = treeIndex.getPerson(key) as Person;
          if (parent) {
            if (parent.isRelated(rootPerson) || parent === rootPerson) {
              connPath.push(treeIndex.getPerson(key) as Person);
              parentKey = key;
            }
          }
        }
      }) 
      
      if (parentKey === rootPerson.getID()){
        return connPath;
      } else {
        const parent = treeIndex.getPerson(parentKey) as Person
        if (parent) {
          return this.getAncestorPath(rootPerson, parent, connPath);
        } else {
          return connPath;
        }
      }
    }
}

export default SubtreeGenerator;
