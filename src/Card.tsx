import React, {useState} from 'react';
import {CardMapElement} from './structures';

type CardProps = {
    element: CardMapElement,
    delete: (id: string) => void
}

const Card: React.FC<CardProps> = (props) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const collapsedString = (s: string) => {
        const parts = back.split('\n');
        return parts.length > 4 ? parts.slice(0, 4).join('\n') + ' (more...)' : parts.join('\n');
    }

    const back = props.element.card.back;
    return (
        <div className="card">
            <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                        <span className="pre-wrap">{props.element.card.front}</span>
                        <span>
                            <button className="btn btn-outline-danger btn-sm mx-1"
                                    onClick={() => props.delete(props.element.id)}>Delete</button>
                            <button className="btn btn-outline-primary btn-sm mx-1"
                                    onClick={toggleExpand}>{expanded ? 'Collapse' : 'Expand'}</button>
                        </span>
                    </div>
                </li>
                <li className="list-group-item pre-wrap">{expanded ? back : collapsedString(back)}</li>
            </ul>
        </div>
    );
};

export default Card;