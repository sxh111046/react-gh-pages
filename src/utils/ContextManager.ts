import { GEDContext } from '../types/GEDContext';
import Person from '../utils/Person';

class ContextManager {
  private static instance: ContextManager;
    
  private static context: GEDContext = { 
      gedFileName: '',
      fileContent: '',
      root: '',
      subtrees: [],
      familyIndex: [],
      personIndex: [],
      treeRoots: [],
      connectors: new Map<string, string[]>(),
      onPersonSelectedChanged: Array<() => void>(),
      selectedPerson: undefined,
      subtreeRoot: undefined,
      collapsedSubtrees: [],
      onSelect: Function, 
      stateCounter: 0,
      genSpacing: 30,
      initialized: false
    };

    private constructor() {
     
    }

    public static getInstance(): ContextManager {
      if (!ContextManager.instance) {
        ContextManager.instance = new ContextManager();
      }
      return ContextManager.instance;
    }

    public getContext(): GEDContext {
      return ContextManager.context;
    }

    public setContext(context: GEDContext) {
      ContextManager.context = context;
    }

    public initContext() {
      const ctx = ContextManager.context;
      ctx.familyIndex = [];
      ctx.treeRoots = [];
      ctx.fileContent = '';
      ctx.gedFileName = '';
      ctx.initialized = false;
      ctx.personIndex = [];
      ctx.collapsedSubtrees = [];
      ctx.onPersonSelectedChanged = new Array<() => void>();
      ctx.root = '';
      ctx.selectedPerson = undefined;
      ctx.subtreeRoot = undefined;
      ctx.connectors = new Map<string, string[]>();
    }

    public setGEDFileName(fileName: string) {
      ContextManager.context.gedFileName = fileName;
    }

    public setFileContent(fileContent: string) {
      ContextManager.context.fileContent = fileContent;
    }

    public setInitialized(init: boolean) {
      ContextManager.context.initialized = init;
    }

    public setRoot(root: string) {
      ContextManager.context.root = root;
    }

    public setSubtrees(subtrees: string[]) {
      ContextManager.context.subtrees = subtrees;
    }
    
    public setSeletedPerson(p: Person) {
      ContextManager.context.selectedPerson= p;
    }

    public setSubtreeRoot(p: Person) {
      ContextManager.context.subtreeRoot= p;
    }

    public upStateCounter() {
      const ctx = ContextManager.getInstance().getContext();
      
      ctx.stateCounter = ctx.stateCounter + 1;
    }

    public getGenSpacing(): number {
      return ContextManager.context.genSpacing as number;
    }

    public setGenSpacing(spacing: number){
      ContextManager.context.genSpacing = spacing;
    }

    public setOnSelect(onSelect: () => void) {
      ContextManager.context.onSelect = onSelect;
    }

    public getOnSelect(): () => void  {
      return ContextManager.context.onSelect;
    }

    public addOnSelectedChanged(callback: () => void) {
      const selectedChanged = this.getContext().onPersonSelectedChanged;
      let exists = false;
      selectedChanged?.forEach(item => {
        if (item.name === callback.name) {
          exists = true;
        }
      })
      if (!exists) selectedChanged?.push(callback);
    }

}

export default ContextManager