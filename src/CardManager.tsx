import React from 'react';
import AddCardForm from './forms/AddCardForm';
import Card from './Card';
import {DisplayResponse, CardData, CardMapElement} from './Structures';
import {auth, db} from './Firebase';
import {doc, getDocs, setDoc, deleteDoc, collection, CollectionReference} from 'firebase/firestore';

type CardManagerState = {
    uid: string,
    collection: CollectionReference<CardData>,
    cards: CardMapElement[],
    error?: string,
    errorClass?: string
};

class CardManager extends React.Component<{}, CardManagerState> {
    constructor(props: {}) {
        super(props);
        const uid = auth.currentUser?.uid as string;
        const cards = collection(db, 'users', uid, 'cards') as CollectionReference<CardData>;
        this.state = {
            uid,
            collection: cards,
            cards: []
        };
        this.listCards();
        this.addCard = this.addCard.bind(this);
        this.listCards = this.listCards.bind(this);
        this.deleteCard = this.deleteCard.bind(this);
    }

    listCards() {
        this.getCards().then(cards => {
            this.setState<'cards'>({
                cards,
                error: undefined,
                errorClass: undefined
            });
        }).catch(err => {
            this.setState<'cards'>({
                cards: [],
                error: 'Failed to get cards: ' + err,
                errorClass: 'text-danger'
            });
        });
    }

    getCards(): Promise<CardMapElement[]> {
        return getDocs(this.state.collection).then(query => {
            let list: CardMapElement[] = [];
            query.forEach(d => {
                list.push({
                    id: d.id,
                    card: d.data()
                });
            });
            return list;
        });
    }

    addCard(front: string, back: string): Promise<DisplayResponse> {
        const d = doc(this.state.collection);
        return setDoc(d, {
            front,
            back
        }).then(() => {
            this.listCards();
            return {
                success: true,
                message: 'Added card to the deck',
                textClass: 'text-success'
            };
        }).catch(err => (
            {
                success: false,
                message: 'Failed to add card: ' + err,
                textClass: 'text-danger'
            }
        ));
    }

    deleteCard(id: string) {
        deleteDoc(doc(this.state.collection, id)).then(this.listCards).catch(err => {
            this.setState<'error'>({
                error: 'Failed to delete card: ' + err,
                errorClass: 'text-danger'
            });
        })
    }

    render() {
        let array = this.state.cards.slice();
        let groups: CardMapElement[][] = [];
        while (array.length > 0) {
            groups.push(array.splice(0, 3));
        }
        const displayCards = groups.map(r => (
            <div className="row mb-3">
                <div className="col-sm">
                    <Card element={r[0]} delete={this.deleteCard}/>
                </div>
                <div className="col-sm">
                    {r.length > 1 && <Card element={r[1]} delete={this.deleteCard}/>}
                </div>
                <div className="col-sm">
                    {r.length > 2 && <Card element={r[2]} delete={this.deleteCard}/>}
                </div>
            </div>
        ));
        return (
            <>
                <AddCardForm onSubmit={this.addCard}/>
                <h2 className="mt-5">Cards</h2>
                {this.state.error && <p className={this.state.errorClass}>{this.state.error}</p>}
                {this.state.cards.length > 0 ? displayCards : <p>No cards yet. Add a card above to get started.</p>}
            </>
        );
    }
}

export default CardManager;