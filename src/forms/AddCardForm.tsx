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
        <div className="row">
            <div className="col-sm-9">
                <form onSubmit={e => {
                    e.preventDefault();

                    if (!front || !front.trim() || !back || !back.trim()) {
                        setMessage('One or both sides of the card is empty');
                        setTextClass('text-danger');
                        return;
                    }

                    props.onSubmit(front, back).then(response => {
                        setMessage(response.message);
                        setTextClass(response.textClass);

                        if (response.success) {
                            setFront('');
                            setBack('');
                        }
                    });
                }}>
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
                    <button type="submit" className="btn btn-primary mb-3">Add</button>
                    <div>
                        {message && <small className={textClass}>{message}</small>}
                    </div>
                </form>
            </div>
            <div className="col-sm-3">
                <AutoFiller word={front} callback={setAutoFillResult}/>
            </div>
        </div>
    );
}

export default AddCardForm;