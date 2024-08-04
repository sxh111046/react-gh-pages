
import {Header} from '../types/Header';
import {Line} from '../types/Line';
import {PersonData} from '../types/PersonData';
import Person from '../utils/Person';
import Family from './Family';

class FamilyTreeParser {
    private fileContent: string[];
	private members: Map<string, Person>;
	private families: Map<string, Family>;
	private notes: Map<string, string>;
	private indMark: boolean;
	private famMark: boolean;
	private EOF: boolean;
	private noteMark: boolean;
	private curLine: Line;
	private gedLineCounter: number = 0;
	private header: Header;
	private rootPerson: Person;
	private treeRoot: Person;
	private firstGen: number;
	private ancestor: boolean[];
	private subtrees: Map<string, Person>;
	//private treeIndex: TreeIndex;

	constructor(public gedFileContent: string) {

		this.fileContent = gedFileContent.split(/\r?\n/);
		// console.log(this.fileContent);

		this.members = new Map<string, Person>();
		this.families = new Map<string, Family>();
		this.notes = new Map<string, string>();
		this.indMark = false;
		this.famMark = false;
		this.EOF = false;
		this.noteMark = false;
		this.curLine = {};
		this.header = {};
		this.rootPerson = new Person(this);
		this.treeRoot = new Person(this);
		this.firstGen = 0;
		this.ancestor = new Array<boolean>();
		this.subtrees = new Map<string, Person>();
	}

	public load() {
		this.readHeader();
		while(!this.famMark && !this.EOF) {
			this.addPerson();
		}
		while(!this.noteMark && !this.EOF) {
			this.addFamily();
		}
		while(!this.EOF) {
			this.addNote();
		}
		this.setFamilyLinks();
		
	}

	readHeader() {

		this.curLine = this.getNextLine();

		let source = true;
		while(!this.indMark && !this.EOF) {
			const desc = this.curLine.desc;
			if(desc === "SOUR")
				this.header.source = this.curLine.value;
			else if (desc === "NAME")
				if (source){
					this.header.sourceName = this.curLine.value;
					source = false;
				}
				else {
					this.header.preparedBy = this.curLine.value;
				}
			else if (desc === "DATE")
				this.header.date = this.curLine.value;
			else if (desc === "TIME")
				this.header.time = this.curLine.value;
			else if (desc ==="FILE")
				this.header.gedFile = this.curLine.value;
			else if (desc === "VERS")
				this.header.gedVersion = this.curLine.value;
			else if (desc === "ADDR")
				this.header.address1 = this.curLine.value;
			else if (desc === "CONT")
				this.header.address2 = this.curLine.value;
			else if (desc === "CTRY")
				this.header.country = this.curLine.value;
			else if (desc === "PHON")
				this.header.tel = this.curLine.value;
			else if (desc === "_EMAIL")
				this.header.email = this.curLine.value;

			this.curLine = this.getNextLine();
		}	
	}

	addFamily() {
		const f = new Family();
		const fData = f.getData();
		fData.id = this.parseFamID(this.curLine.desc as string);
		this.curLine = this.getNextLine();
		while(!this.famMark && !this.noteMark && !this.EOF){
			const desc = this.curLine.desc;
			if(desc === "HUSB"){
				fData.husband = this.members.get(this.parseID(this.curLine.value));
			}
			else if (desc === "WIFE")
				fData.wife = this.members.get(this.parseID(this.curLine.value));
			else if (desc === "CHIL") {
				const person = this.members.get(this.parseID(this.curLine.value));
				if (person)
					fData.children?.push(person);
			}
			this.curLine = this.parseLine(this.getGEDLine());
			// if (!this.curLine) break;
		}
		this.families.set(fData.id, f);
	}
	
	parseID(str?: string): string
	{
		if (!str) str = this.curLine.desc;
		if (str) {
			return str.substring(2, str.length -1 );
		}
		return '';
	}

	parseFamID(str: string): string
	{
		if (str)
			return str.substring(1, str.length - 1);
		else
			return "";
	}

	setFamilyLinks() {
		this.members.forEach((p: Person, id: string) => {
			if (p && p.getData().sFamilyID) {
				let fID = p.getData().pFamilyID;
				if (fID) {
					p.getData().parentFamily = this.families.get(fID);
				}
				const sFamilyID = p.getData().sFamilyID;
				// let spouseFamily = p.getData().spouseFamily;
				if (sFamilyID) {
					for (let j = 0; j < sFamilyID.length; j++) {
						const famId = sFamilyID[j];
						let sFamily = this.families.get(famId);
						if (sFamily)
							p.getData().spouseFamily?.push(sFamily);
					}
				}
			}
		})
	}

	parseLine(line: string): Line
	{
		const token: string[] = line.split(' ')
		const ln:Line = {};
		if (token[0] != null){
			ln.number = parseInt(token[0]);

			ln.desc = token[1];
			ln.value = '';
			for (let i = 2; i< token.length; i++) {
				ln.value+= token[i].trim() + " ";
			}

			ln.value = ln.value?.trim();
		}
		this.indMark = false;
		this.famMark = false;
		this.noteMark = false;
		
		// console.log(ln.value);
		if (ln.value === "INDI")
			this.indMark = true;
		if (ln.value === "FAM")
			this.famMark = true;
		if (ln.value === "NOTE") {
			this.noteMark = true;
		}
		if (ln.desc === "TRLR")
			this.EOF = true;
	
		return ln;
	}

	getNextLine(): Line {
		return this.parseLine(this.getGEDLine());
	}

	getGEDLine(): string {
		if (this.gedLineCounter < this.fileContent.length) {
			const counter = this.gedLineCounter;
			this.gedLineCounter++;
			return this.fileContent[counter];
		} else {
			this.EOF = true;
			return '';
		}
	}

	addPerson()
	{
		let birth = false;
		let death = false;
		let burial = false;
		let readNote = false;
		let histNote = false;
		let healthNote = false;
		
		const p:Person = new Person(this);
		const pData:PersonData = p.getData();
		pData.id = this.parseID();
		this.curLine = this.getNextLine();
		
		while(!this.indMark && !this.famMark && !this.EOF){
			const desc = this.curLine.desc;
			const lineValue = this.curLine.value as string;
			if(desc === "GIVN")
				if (lineValue)
					pData.firstName = lineValue;
				else 
					pData.firstName = '?';
			else if (desc === "SURN") {
				// console.log('surname: ' + lineValue);
				if (lineValue) {
					pData.surname = lineValue;
				} else {
					pData.surname = '?';
				}
			}
			else if (desc === "NAME")
				p.parseName(lineValue);
			else if (desc === "SEX")
				pData.sex = lineValue;
			else if (desc === "NOTE") {
				const note = lineValue;	
				if (note.startsWith("@"))
					pData.note = this.parseFamID(lineValue);
				else if (readNote)
					pData.note += "\n" + note;
				else if (!pData.note)
					pData.note = note;
				readNote = true;
				histNote = false;
				healthNote = false;
			}
			else if (readNote && desc === "CONC")
				pData.note+= lineValue;
			else if (readNote && desc === "CONT")
				pData.note+= "\n" + lineValue;
			else if (histNote && desc ==="CONC")
				pData.history+= lineValue;
			else if (histNote && desc === "CONT")
				pData.history+= "\n" + lineValue;
			else if (healthNote && desc === "CONC")
				pData.health+= lineValue;
			else if (healthNote && desc === "CONT")
				pData.health+= "\n" + lineValue;
			else if (desc === "HIST") {
				const hist = lineValue;	
				if (hist.startsWith("@"))
					pData.history = this.parseFamID(lineValue);
				else if (histNote)
					pData.history += "\n" + hist;
				else 
					pData.history = hist;
				histNote = true;
				readNote = false;
				healthNote = false;
			}
			else if (desc === "HEAL") {
				const health = lineValue;	
				if (health.startsWith("@"))
					pData.health = this.parseFamID(lineValue);
				else if (healthNote)
					pData.health += "\n" + health;
				else 
					pData.health = health;
				healthNote = true;
				histNote = false;
				readNote = false;
			}
			else if (desc === "RELI")
				pData.religion = lineValue;
			else if (desc === "OCCU")
				pData.occupation = lineValue;
			else if (desc === "EDUC")
				pData.education = lineValue;
			else if (desc === "FAMC") {
				pData.pFamilyID = this.parseFamID(lineValue);
				// console.log('FAMC ' + pData.surname + ' ' + pData.firstName + ' ' + this.parseFamID(lineValue));
			}
			else if (desc === "FAMS") {
				if (!pData.sFamilyID) 
					pData.sFamilyID = new Array<string>();
				pData.sFamilyID.push(this.parseFamID(lineValue));
				// console.log('FAMS ' + pData.surname + ' ' + pData.firstName + ' ' + this.parseFamID(lineValue));
			}
			else if (desc === "BIRT")
				birth = true;
			else if (desc === "DEAT") {
				birth = false;
				death = true;
			}
			else if (desc === "BURI") {
				birth = false;
				death = false;
				burial = true;
			}
			else if (desc === "CHAN") {
				birth = false;
				death = false;
				readNote = false;
				histNote = false;
				healthNote = false;
				burial = false;
			}
			else if (desc === "DATE") {
				if (birth)
					pData.birthDate = lineValue;
				else if (death)
					pData.deathDate = lineValue;
				else if (burial)
					pData.burialDate = lineValue;
				else
					pData.lastUpdate = new Date(lineValue);
			}
			else if (desc === "PLAC") {
				if (birth)
					pData.birthPlace = lineValue;
				else if (death)
					pData.deathPlace = lineValue;
				else if (burial)
					pData.burialPlace = lineValue;
			}
				
			p.setData(pData);
			this.curLine = this.getNextLine();
			// if (!this.curLine) break;
		}
		this.members.set(pData.id, p);
	}

	public setRootPerson(id: string)
	{
		const p = this.members.get(id);
		if (p) p.setGenNumber(0);
	}

	public initRootPerson(person: Person)
	{
		this.rootPerson = person;
	}

	setAncestors(p: Person)
	{
		const pData = p.getData();
		const gen = pData.gen;

		if (gen === this.firstGen) {
			this.ancestor[gen] = true;
			return;
		}
		let lastGen = false;
		// const name = p.getName();
		if (gen) {
			if (gen > 0) {
			this.ancestor[gen - 1] = true;
			}
			if(p.isLastChild()) {
				this.ancestor[gen - 1] = false;
				if (gen === this.firstGen + 1)
					lastGen = true;		 
			}
		}
		if(!lastGen){
		   const parent = p.getParent(this.rootPerson);
		   if (parent != null)
			   this.setAncestors(parent);
		}
	}

	addNote()
	{
		let note = "";
		const noteID = this.parseFamID(this.curLine.desc as string);
		this.curLine = this.getNextLine();
		const value = this.curLine.value as string;
		while(!this.noteMark && !this.EOF){
			const desc = this.curLine.desc;
			if(desc === "NOTE")
				note = value;
			else if (desc === "CONC")
				note+= " " + value;
			else if (desc === "CONT")
				note+= value+ "\n";
			this.curLine = this.getNextLine();
		}
		this.notes.set(noteID, note);
	}

	public getPerson(id: string): Person | undefined
	{
		return this.members.get(id);
	}

	public getMembers(): Map<string, Person> {
		return this.members;
	}

	public getFamilies(): Map<string, Family> {
		return this.families;
	}

}

export default FamilyTreeParser;