import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './App.css';
import Navbar from './Navbar';
import ContentPanel from './ContentPanel';
import {PageState} from './structures';
import {auth} from './firebase';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, User} from 'firebase/auth';

type AppState = {
    signedIn: boolean,
    signInError?: string,
    registerError?: string,
    page: PageState
}

class App extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            signedIn: false,
            page: PageState.Main
        };
        this.showSignIn = this.showSignIn.bind(this);
        this.showRegister = this.showRegister.bind(this);
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.authStateChanged = this.authStateChanged.bind(this);
        auth.onAuthStateChanged(this.authStateChanged);
    }

    showSignIn() {
        this.setState<'page'>({
            page: PageState.SignIn
        });
    }

    showRegister() {
        this.setState<'page'>({
            page: PageState.Register
        });
    }

    signIn(email: string, password: string) {
        signInWithEmailAndPassword(auth, email, password).catch(err => {
            let msg;
            switch (err.code) {
                case 'auth/invalid-email':
                    msg = "Invalid email";
                    break;
                case 'auth/user-disabled':
                    msg = "Account has been disabled";
                    break;
                case 'auth/user-not-found':
                    msg = "Account not found";
                    break;
                case 'auth/wrong-password':
                    msg = "Incorrect password";
                    break;
                default:
                    msg = "Unknown error";
            }
            this.setState<'signInError'>({
                signInError: msg
            })
        });
    }

    register(email: string, password: string, confirmPassword: string) {
        if (password !== confirmPassword) {
            this.setState<'registerError'>({
                registerError: "Passwords do not match"
            });
            return;
        }

        createUserWithEmailAndPassword(auth, email, password).catch(err => {
            let msg;
            switch (err.code) {
                case 'auth/email-already-in-use':
                    msg = "Email already in use";
                    break;
                case 'auth/invalid-email':
                    msg = "Invalid email";
                    break;
                case 'auth/weak-password':
                    msg = "Password is too weak";
                    break;
                default:
                    msg = "Unknown error";
            }
            this.setState<'registerError'>({
                registerError: msg
            })
        });
    }

    signOut() {
        // noinspection JSIgnoredPromiseFromCall
        auth.signOut();
    }

    authStateChanged(user: User | null) {
        if (user) {
            this.setState<'signedIn'>({
                signedIn: true,
                signInError: undefined,
                registerError: undefined,
                page: PageState.Main
            });
        }
        else {
            this.setState<'signedIn'>({
                signedIn: false,
                page: PageState.Main
            });
        }
    }

    render() {
        return (
            <>
                <Navbar signedIn={this.state.signedIn} signIn={this.showSignIn} register={this.showRegister}
                        signOut={this.signOut}/>
                <div className="container">
                    <ContentPanel signedIn={this.state.signedIn} page={this.state.page} signIn={this.signIn}
                                  register={this.register}/>
                </div>
            </>
        );
    }
}

export default App;
