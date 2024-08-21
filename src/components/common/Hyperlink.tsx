import React from 'react';

export interface HyperlinkProps {
    target?: string;
    linkID?: string;
    class?: string;
    title?: string;
    image?: any;
    callback: (event: any) => void;
}

class Hyperlink extends React.Component {

    public props: HyperlinkProps;
    
    public constructor(props: HyperlinkProps) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <div className = {this.props.class}> 
                <a id={this.props.linkID} className = {this.props.class} onClick={(event: any) => this.props.callback(event)} href='#'>{this.props.title}</a><span>  </span>{this.props.image}
            </div>
        )
    }
}

export default Hyperlink
