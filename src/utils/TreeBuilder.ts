
import FamilyTreeParser from './FamilyTreeParser';
import TreeIndex from './TreeIndex';
import ContextManager from './ContextManager';

class TreeBuilder {

    public build() {
        try{
          const context =  ContextManager.getInstance().getContext();
          const parser: FamilyTreeParser = new FamilyTreeParser(context.fileContent as string);
          parser.load();
          const treeIndex = new TreeIndex(parser.getMembers());
          treeIndex.initialize();
          context.familyIndex = treeIndex.getFamilyIndex();
          context.personIndex = treeIndex.getPersonIndex();
          context.treeRoots = treeIndex.buildTrees();
          context.selectedPerson = treeIndex.getPerson(context.root as string);
          context.subtreeRoot = treeIndex.getPerson(context.root as string);
          context.initialized = true;
        }
        catch(ex) {
            localStorage.setItem('keyStore', '');
            alert('unexpected error occured during tree building');
        }
    }
}

export default TreeBuilder