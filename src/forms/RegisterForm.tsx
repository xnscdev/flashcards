import React, {useId, useState} from 'react';

type RegisterFormProps = {
    onSubmit: (email: string, password: string, confirmPassword: string) => void,
    error?: string
};

const RegisterForm: React.FC<RegisterFormProps> = (props: RegisterFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const emailId = useId();
    const passwordId = useId();
    const confirmPasswordId = useId();
    return (
        <form onSubmit={e => {
            props.onSubmit(email, password, confirmPassword);
            e.preventDefault();
        }}>
            <h2>Register</h2>
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
            <div className="mb-3">
                <label htmlFor={confirmPasswordId} className="form-label">Confirm password</label>
                <input type="password" id={confirmPasswordId} className="form-control" value={confirmPassword}
                       onChange={e => setConfirmPassword(e.target.value)}/>
            </div>
            <button type="submit" className="btn btn-primary mb-3">Register</button>
            <div>
                {props.error && <small className="text-danger">Registration failed: {props.error}</small>}
            </div>
        </form>
    );
}

export default RegisterForm;