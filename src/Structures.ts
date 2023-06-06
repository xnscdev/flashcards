export enum PageState {
    Main,
    SignIn,
    Register
}

export type DisplayResponse = {
    success: boolean,
    message: string,
    textClass: string
};

export type CardData = {
    front: string,
    back: string
};

export type CardMapElement = {
    id: string,
    card: CardData
};