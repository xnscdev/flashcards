import React from 'react';
import AddCardForm from './forms/AddCardForm';
import SelectDeckForm from './forms/SelectDeckForm';
import Card from './Card';
import ReviewCard from './ReviewCard';
import {DisplayResponse, DeckData, DeckMapElement, CardData, CardMapElement} from './structures';
import {auth, db} from './firebase';
import {doc, collection, getDocs, setDoc, deleteDoc, updateDoc, CollectionReference} from 'firebase/firestore';
import {shuffleArray} from './util';

type CardManagerState = {
    uid: string,
    decksCollection: CollectionReference<DeckData>,
    cardsCollection?: CollectionReference<CardData>,
    decks: DeckMapElement[],
    deck?: DeckMapElement,
    cards: CardMapElement[],
    reviewCards?: CardMapElement[],
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
        this.review = this.review.bind(this);
        this.reviewNext = this.reviewNext.bind(this);
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

    updateDeck(): Promise<void> {
        if (!this.state.deck)
            return Promise.reject('No deck selected');
        return updateDoc(doc(this.state.decksCollection, this.state.deck.id), this.state.deck.deck);
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

    review() {
        let cards: CardMapElement[];
        try {
            cards = this.getCardsForReview();
        }
        catch (err) {
            this.setState({
                cardError: 'Failed to start review session: ' + err
            });
            return;
        }
        this.setState({
            reviewCards: cards
        });
    }

    reviewNext(success: boolean): Promise<void> {
        if (!this.state.reviewCards || !this.state.cardsCollection)
            return Promise.reject('No deck selected or not in review mode');

        const e = this.state.reviewCards[0];
        const d = doc(this.state.cardsCollection, e.id);
        if (success) {
            if (e.card.box < 4)
                e.card.box++;
        }
        else {
            e.card.box = 0;
        }

        const remainingCards = this.state.reviewCards.slice(1);
        return new Promise<void>(resolve => {
            this.setState({
                deck: {
                    ...this.state.deck!,
                    deck: {
                        ...this.state.deck!.deck,
                        sessionCards: remainingCards.map(e => e.id)
                    }
                }
            }, () => {
                this.updateDeck().then(() => updateDoc(d, e.card)).then(() => {
                    this.setState({
                        reviewCards: remainingCards.length === 0 ? undefined : remainingCards
                    });
                    resolve();
                }).catch(console.error);
            });
        });
    }

    getCardsForReview(): CardMapElement[] {
        if (!this.state.deck)
            throw new Error('No deck selected');

        if (this.state.deck.deck.sessionCards.length > 0) {
            return this.state.deck.deck.sessionCards.map(id => {
                const card = this.state.cards.find(card => card.id === id);
                if (!card)
                    throw new Error('No card found');
                return card;
            });
        }

        let cards = this.state.cards.slice();
        shuffleArray(cards);
        cards.sort((a, b) => a.card.box - b.card.box);
        cards.splice(10, Infinity);
        if (cards.length === 0)
            throw new Error('No cards to review');
        return cards;
    }

    render() {
        let cards = this.state.cards.map(card => (
            <div className="col-md-4 mt-4" key={card.id}>
                <Card element={card} delete={this.deleteCard}/>
            </div>
        ));
        return (
            <>
                <h2>Deck</h2>
                {this.state.deckError && <p className="text-danger">Error loading decks</p>}
                <SelectDeckForm decks={this.state.decks} selectDeck={this.selectDeck} createDeck={this.createDeck}
                                deleteDeck={this.deleteDeck}/>
                {this.state.reviewCards ?
                    <>
                        <h2 className="mt-4">Review cards</h2>
                        <h4>{this.state.reviewCards.length} card{this.state.reviewCards.length !== 1 && 's'} remaining</h4>
                        <ReviewCard element={this.state.reviewCards[0]} doNext={this.reviewNext}/>
                    </>
                    : this.state.deck &&
                    <>
                        <h2 className="mt-4">Add card</h2>
                        <AddCardForm onSubmit={this.addCard}/>
                        <h2 className="mt-4">Cards</h2>
                        <button type="button" className="btn btn-primary" onClick={this.review}>Review</button>
                        {this.state.cardError && <p className="text-danger">{this.state.cardError}</p>}
                        {this.state.cards.length === 0 ? <p>No cards yet. Add a card above to get started.</p> :
                            <div className="row mb-5">{cards}</div>}
                    </>
                }
            </>
        );
    }
}

export default CardManager;