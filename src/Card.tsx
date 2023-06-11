import React, {useState} from 'react';
import {CardMapElement} from './structures';
import {boxStrings} from './box';

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
        const maxLines = 4;
        const parts = s.split('\n');
        return parts.length > maxLines ? parts.slice(0, maxLines).join('\n') + ' (more...)' : parts.join('\n');
    }

    const back = props.element.card.back;
    return (
        <div className="card">
            <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    <div className="row">
                        <div className="pre-wrap col">{props.element.card.front}</div>
                        <div className="col-auto">
                            <div>
                                <button className="btn btn-outline-danger btn-sm"
                                        onClick={() => props.delete(props.element.id)}>Delete</button>
                                <button className="btn btn-outline-primary btn-sm ms-2"
                                        onClick={toggleExpand}>{expanded ? 'Collapse' : 'Expand'}</button>
                            </div>
                            <div>
                                <span className="float-end text-muted mt-1">{boxStrings[props.element.card.box]}</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li className="list-group-item pre-wrap">{expanded ? back : collapsedString(back)}</li>
            </ul>
        </div>
    );
};

export default Card;