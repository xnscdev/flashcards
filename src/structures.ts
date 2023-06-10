export enum PageState {
    Main,
    SignIn,
    Register
}

export type DisplayResponse = {
    success: boolean,
    message: string
};

export type DeckData = {
    name: string,
    session: number,
    sessionCards: string[]
};

export type DeckMapElement = {
    id: string,
    deck: DeckData
};

export type CardData = {
    front: string,
    back: string,
    box: number
};

export type CardMapElement = {
    id: string,
    card: CardData
};