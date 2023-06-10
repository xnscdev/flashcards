import React from 'react';
import AddCardForm from './forms/AddCardForm';
import SelectDeckForm from './forms/SelectDeckForm';
import Card from './Card';
import {DisplayResponse, DeckData, DeckMapElement, CardData, CardMapElement} from './structures';
import {auth, db} from './firebase';
import {doc, getDocs, setDoc, deleteDoc, collection, CollectionReference} from 'firebase/firestore';

type CardManagerState = {
    uid: string,
    decksCollection: CollectionReference<DeckData>,
    cardsCollection?: CollectionReference<CardData>,
    decks: DeckMapElement[],
    deck?: DeckMapElement,
    cards: CardMapElement[],
    deckError: boolean
    cardError?: string
};

class CardManager extends React.Component<{}, CardManagerState> {
    constructor(props: {}) {
        super(props);
        const uid = auth.currentUser?.uid as string;
        const decks = collection(db, 'users', uid, 'decks') as CollectionReference<DeckData>;
        this.state = {
            uid,
            decksCollection: decks,
            decks: [],
            cards: [],
            deckError: false
        };
        this.selectDeck = this.selectDeck.bind(this);
        this.createDeck = this.createDeck.bind(this);
        this.deleteDeck = this.deleteDeck.bind(this);
        this.addCard = this.addCard.bind(this);
        this.listCards = this.listCards.bind(this);
        this.deleteCard = this.deleteCard.bind(this);
    }

    componentDidMount() {
        this.listDecks();
    }

    listDecks() {
        this.getDecks().then(decks => {
            this.setState({
                decks,
                deckError: false
            });
        }).catch(() => {
            this.setState({
                deckError: true
            });
        })
    }

    listCards() {
        this.getCards().then(cards => {
            this.setState({
                cards,
                cardError: undefined
            });
        }).catch(err => {
            this.setState({
                cards: [],
                cardError: 'Failed to get cards: ' + err
            });
        });
    }

    getDecks(): Promise<DeckMapElement[]> {
        return getDocs(this.state.decksCollection).then(query => {
            let list: DeckMapElement[] = [];
            query.forEach(d => {
                list.push({
                    id: d.id,
                    deck: d.data()
                });
            });
            return list;
        });
    }

    getCards(): Promise<CardMapElement[]> {
        if (!this.state.cardsCollection)
            return Promise.reject('No deck selected');

        return getDocs(this.state.cardsCollection).then(query => {
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

    selectDeck(id: string): DisplayResponse {
        const deck = this.state.decks.find(deck => deck.id === id);
        if (!deck) {
            return {
                success: false,
                message: 'No deck exists with ID ' + id
            };
        }

        this.setState({
            cardsCollection: collection(this.state.decksCollection, deck.id, 'cards') as CollectionReference<CardData>,
            deck
        }, this.listCards);
        return {
            success: true,
            message: 'Selected deck: ' + deck.deck.name
        };
    }

    createDeck(name: string): Promise<DisplayResponse> {
        const d = doc(this.state.decksCollection);
        const deck: DeckData = {
            name,
            session: 0,
            sessionCards: []
        };
        return setDoc(d, deck).then(() => {
            this.setState({
                cardsCollection: collection(d, 'cards') as CollectionReference<CardData>,
                deck: {
                    id: d.id,
                    deck
                }
            }, this.listCards);
            this.listDecks();
            return {
                success: true,
                message: 'Created new deck: ' + name
            };
        }).catch(err => (
            {
                success: false,
                message: 'Failed to create new deck: ' + err
            }
        ));
    }

    deleteDeck(id: string): Promise<DisplayResponse> {
        if (!window.confirm('Really delete this deck? All cards will be lost.')) {
            return Promise.resolve({
                success: false,
                message: 'Canceled deleting deck'
            });
        }

        return deleteDoc(doc(this.state.decksCollection, id)).then(() => {
            if (this.state.deck?.id === id) {
                this.setState({
                    deck: undefined
                });
            }
            this.listDecks();
            return {
                success: true,
                message: 'Successfully deleted deck'
            };
        }).catch(err => (
            {
                success: false,
                message: 'Failed to delete deck: ' + err
            }
        ));
    }

    addCard(front: string, back: string): Promise<DisplayResponse> {
        if (!this.state.cardsCollection)
            return Promise.reject('No deck selected');

        const d = doc(this.state.cardsCollection);
        return setDoc(d, {
            front,
            back,
            box: 0
        }).then(() => {
            this.listCards();
            return {
                success: true,
                message: 'Added card to the deck'
            };
        }).catch(err => (
            {
                success: false,
                message: 'Failed to add card: ' + err
            }
        ));
    }

    deleteCard(id: string) {
        if (!this.state.cardsCollection)
            return;

        deleteDoc(doc(this.state.cardsCollection, id)).then(this.listCards).catch(err => {
            this.setState({
                cardError: 'Failed to delete card: ' + err
            });
        })
    }

    render() {
        let cards = this.state.cards.map(card => (
            <div className="col-sm-4 mt-4" key={card.id}>
                <Card element={card} delete={this.deleteCard}/>
            </div>
        ));
        return (
            <>
                <h2>Deck</h2>
                {this.state.deckError && <p className="text-danger">Error loading decks</p>}
                <SelectDeckForm decks={this.state.decks} selectDeck={this.selectDeck} createDeck={this.createDeck}
                                deleteDeck={this.deleteDeck}/>
                {this.state.deck &&
                    <>
                        <h2 className="mt-4">Add card</h2>
                        <AddCardForm onSubmit={this.addCard}/>
                        <h2 className="mt-4">Cards</h2>
                        {this.state.cardError && <p className="text-danger">{this.state.cardError}</p>}
                        {this.state.cards.length === 0 ? <p>No cards yet. Add a card above to get started.</p> :
                            <div className="row">{cards}</div>}
                    </>
                }
            </>
        );
    }
}

export default CardManager;