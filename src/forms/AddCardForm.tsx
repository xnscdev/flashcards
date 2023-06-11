import React, {useId, useState} from 'react';
import {DisplayResponse} from '../structures';
import AutoFiller from '../AutoFiller';

type AddCardFormProps = {
    onSubmit: (front: string, back: string) => Promise<DisplayResponse>
};

const AddCardForm: React.FC<AddCardFormProps> = (props: AddCardFormProps) => {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [message, setMessage] = useState('');
    const [textClass, setTextClass] = useState('');
    const frontId = useId();
    const backId = useId();

    const addCard = () => {
        if (!front || !front.trim() || !back || !back.trim()) {
            setMessage('One or both sides of the card is empty');
            setTextClass('text-danger');
            return;
        }

        props.onSubmit(front, back).then(response => {
            setMessage(response.message);
            setTextClass(response.success ? 'text-success' : 'text-danger');

            if (response.success) {
                setFront('');
                setBack('');
            }
        });
    };

    const setAutoFillResult = (success: boolean, result: string) => {
        if (success) {
            setBack(result);
            setMessage('');
        }
        else {
            setMessage(result);
            setTextClass('text-danger');
        }
    }

    return (
        <>
            <div className="row mb-3">
                <div className="col-sm-9">
                    <label htmlFor={frontId} className="form-label">Front</label>
                    <div className="mb-3">
                        <textarea rows={8} id={frontId} className="form-control" value={front}
                                  onChange={e => setFront(e.target.value)}/>
                    </div>
                    <label htmlFor={backId} className="form-label">Back</label>
                    <div className="mb-3">
                        <textarea rows={8} id={backId} className="form-control" value={back}
                                  onChange={e => setBack(e.target.value)}/>
                    </div>
                </div>
                <div className="col-sm-3">
                    <AutoFiller word={front} callback={setAutoFillResult}/>
                </div>
            </div>
            <div>
                <button className="btn btn-primary" onClick={addCard}>Add</button>
                <div>
                    {message && <small className={textClass}>{message}</small>}
                </div>
            </div>
        </>
    );
}

export default AddCardForm;