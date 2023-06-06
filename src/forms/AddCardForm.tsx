import React, {useId, useState} from 'react';
import {DisplayResponse} from '../Structures';

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
    return (
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
            <h2>Add card</h2>
            <div className="row">
                <label htmlFor={frontId} className="form-label">Front</label>
            </div>
            <div className="row mb-3">
                <div className="col-sm-10">
                    <textarea rows={8} id={frontId} className="form-control" value={front}
                              onChange={e => setFront(e.target.value)}/>
                </div>
            </div>
            <div className="row">
                <label htmlFor={backId} className="form-label">Back</label>
            </div>
            <div className="row mb-3">
                <div className="col-sm-10">
                    <textarea rows={8} id={backId} className="form-control" value={back}
                              onChange={e => setBack(e.target.value)}/>
                </div>
                <div className="col-sm-2">
                    <p>Auto-fill definition</p>
                    <button type="button" className="btn btn-light">Wiktionary</button>
                </div>
            </div>
            <button type="submit" className="btn btn-primary mb-3">Add</button>
            <div>
                {message && <small className={textClass}>{message}</small>}
            </div>
        </form>
    );
}

export default AddCardForm;