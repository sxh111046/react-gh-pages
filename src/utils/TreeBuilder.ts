
import FamilyTreeParser from './FamilyTreeParser';
import TreeIndex from './TreeIndex';
import ContextManager from './ContextManager';
import ErrorHandler from './ErrorHandler';

class TreeBuilder {

    public build() {
        try{
          const context =  ContextManager.getInstance().getContext();
          const parser: FamilyTreeParser = new FamilyTreeParser(context.fileContent as string);
          parser.load();
          if (parser.getMembers().size === 0) {
            new ErrorHandler("this family tree does not have members");
          }
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
            new ErrorHandler('unexpected error occured during tree building', ex)
        }
    }
}

export default TreeBuilder