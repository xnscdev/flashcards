import React, {useId, useState} from 'react';

type SignInFormProps = {
    onSubmit: (email: string, password: string) => void,
    error?: string
};

const SignInForm: React.FC<SignInFormProps> = (props: SignInFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const emailId = useId();
    const passwordId = useId();
    return (
        <form onSubmit={e => {
            props.onSubmit(email, password);
            e.preventDefault();
        }}>
            <h2>Sign in</h2>
            <div className="mb-3">
                <label htmlFor={emailId} className="form-label">Email</label>
                <input type="email" id={emailId} className="form-control" value={email}
                       onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="mb-3">
                <label htmlFor={passwordId} className="form-label">Password</label>
                <input type="password" id={passwordId} className="form-control" value={password}
                       onChange={e => setPassword(e.target.value)}/>
            </div>
            <button type="submit" className="btn btn-primary mb-3">Sign in</button>
            <div>
                {props.error && <small className="text-danger">Sign in failed: {props.error}</small>}
            </div>
        </form>
    );
}

export default SignInForm;