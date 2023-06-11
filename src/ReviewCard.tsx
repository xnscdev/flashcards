import React, {useState} from 'react';
import {CardMapElement} from './structures';

type ReviewCardProps = {
    element: CardMapElement,
    doNext: (success: boolean) => Promise<void>
}

const ReviewCard: React.FC<ReviewCardProps> = (props) => {
    const [revealed, setRevealed] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const next = (success: boolean) => {
        setDisabled(true);
        props.doNext(success).then(() => {
            setRevealed(false);
            setDisabled(false);
        });
    };

    return (
        <>
            <div className="border border-primary rounded p-5 mt-5">
                <h2 className="text-center">{props.element.card.front}</h2>
            </div>
            <button className="btn btn-primary w-100 mt-3" onClick={() => setRevealed(!revealed)}>Reveal</button>
            {revealed &&
                <>
                    <div className="border border-primary rounded p-5 mt-3">
                        <p className="pre-wrap">{props.element.card.back}</p>
                    </div>
                    <div className="row mt-3">
                        <div className="col">
                            <button className="btn btn-success w-100" disabled={disabled}
                                    onClick={() => next(true)}>Correct
                            </button>
                        </div>
                        <div className="col">
                            <button className="btn btn-danger w-100" disabled={disabled}
                                    onClick={() => next(false)}>Incorrect
                            </button>
                        </div>
                    </div>
                </>
            }
        </>
    );
};

export default ReviewCard;