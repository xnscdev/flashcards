import React, {useId, useState} from 'react';
import {DeckMapElement, DisplayResponse} from '../structures';

type SelectDeckFormProps = {
    decks: DeckMapElement[],
    selectDeck: (id: string) => DisplayResponse,
    createDeck: (name: string) => Promise<DisplayResponse>,
    deleteDeck: (id: string) => Promise<DisplayResponse>
};

const SelectDeckForm: React.FC<SelectDeckFormProps> = (props: SelectDeckFormProps) => {
    const createId = useId();
    const [deck, setDeck] = useState(createId);
    const [deckName, setDeckName] = useState('');
    const [message, setMessage] = useState('');
    const [color, setColor] = useState('');
    const existingId = useId();
    const newId = useId();

    const deckElements = props.decks.map(e => <option value={e.id} key={e.id}>{e.deck.name}</option>);

    const updateResponse = (response: DisplayResponse) => {
        setMessage(response.message);
        setColor(response.success ? 'text-success' : 'text-danger');
    }

    const deleteDeck = () => {
        if (deck === createId) {
            setMessage('Please select a deck to delete');
            setColor('text-danger');
        }
        else {
            props.deleteDeck(deck).then(updateResponse).catch(err => {
                setMessage('Failed to delete deck: ' + err);
                setColor('text-danger');
            });
        }

        setDeck(createId);
    }

    return (
        <form onSubmit={e => {
            e.preventDefault();
            if (deck === createId) {
                props.createDeck(deckName).then(response => {
                    updateResponse(response);
                    setDeckName('');
                }).catch(err => {
                    setMessage('Failed to create deck: ' + err);
                    setColor('text-danger');
                });
            }
            else {
                updateResponse(props.selectDeck(deck));
            }
        }}>
            <div className="row">
                <div className="col">
                    <label htmlFor={existingId} className="form-label">Select deck</label>
                    <select className="form-select" value={deck} id={existingId}
                            onChange={e => setDeck(e.target.value)}>
                        {deckElements}
                        <option value={createId}>Create new...</option>
                    </select>
                </div>
                <div className="col">
                    {deck === createId &&
                        <>
                            <label htmlFor={newId} className="form-label">Create a new deck</label>
                            <input type="text" id={newId} className="form-control" value={deckName}
                                   onChange={e => setDeckName(e.target.value)}/>
                        </>
                    }
                </div>
            </div>
            <div className="mt-3">
                <button type="submit" className="btn btn-primary me-3">Select</button>
                <button type="button" className="btn btn-danger me-3" onClick={deleteDeck}>Delete</button>
            </div>
            <div>
                {message && <small className={color}>{message}</small>}
            </div>
        </form>
    );
}

export default SelectDeckForm;