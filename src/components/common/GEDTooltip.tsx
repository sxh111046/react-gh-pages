import React from 'react';
import {PlacesType, Tooltip} from "react-tooltip";

export interface GEDTooltipProps {
    anchorSelect?: string;
    content?: string;
    place?: PlacesType;
}

function GEDTooltip(props: GEDTooltipProps) {

    return (
        <>
            <a id={"#" + props.anchorSelect} ></a>
            <Tooltip anchorSelect={"#" + props.anchorSelect} content={props.content} place={props.place}/>
        </>
    )
    
}

export default GEDTooltip
