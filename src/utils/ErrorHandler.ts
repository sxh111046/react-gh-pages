

class ErrorHandler {

    constructor( message: string, ex?: any) {
        localStorage.setItem('keyStore', '');
        this.reportError(message, ex);
    }

    private reportError(message: string, ex?: any) {
        alert(message);
        this.launchFamilyTree();
    }

    private launchFamilyTree() {
        let url = window.location.origin + window.location.pathname;
        if (!url.includes('index.html')) {
            url += 'index.html';
        }
        window.open(url, '_self');
    }
   
}

export default ErrorHandler