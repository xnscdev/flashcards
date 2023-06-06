import React from "react";
import {CardMapElement} from './Structures';

type CardProps = {
    element: CardMapElement,
    delete: (id: string) => void
}

const Card: React.FC<CardProps> = (props) => {
    return (
        <div className="card" key={props.element.id}>
            <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                        <span>{props.element.card.front}</span>
                        <button className="btn btn-outline-danger btn-sm"
                                onClick={() => props.delete(props.element.id)}>Delete
                        </button>
                    </div>
                </li>
                <li className="list-group-item">{props.element.card.back}</li>
            </ul>
        </div>
    )
};

export default Card;