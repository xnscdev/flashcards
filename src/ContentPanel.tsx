import React from 'react';
import SignInForm from './forms/SignInForm';
import RegisterForm from './forms/RegisterForm';
import {PageState} from './Structures';
import CardManager from './CardManager';

type ContentProps = {
    signedIn: boolean,
    page: PageState,
    signIn: (email: string, password: string) => void,
    register: (email: string, password: string, confirmPassword: string) => void,
    signInError?: string,
    registerError?: string
};

const ContentPanel: React.FC<ContentProps> = (props: ContentProps) => {
    if (props.page === PageState.SignIn)
        return <SignInForm onSubmit={props.signIn} error={props.signInError}/>;
    else if (props.page === PageState.Register)
        return <RegisterForm onSubmit={props.register} error={props.registerError}/>;
    else if (!props.signedIn)
        return <p>Please sign in or register using the links above.</p>;
    else
        return <CardManager/>
}

export default ContentPanel;