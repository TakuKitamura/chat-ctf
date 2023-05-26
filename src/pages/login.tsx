import React, { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
// import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';


import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormGroup from '@mui/material/FormGroup';
import InputAdornment from "@mui/material/InputAdornment"

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const escape = require('escape-html');

export default function Login() {

    const [userID, setUserID] = useState('');

    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);


    // const inputRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");

    const emptyImage = '/1f600.png'

    const login = async () => {
        const resp = await fetch(`/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "userID": userID,
                "password": password
            }),
        });

        if (resp.status !== 200) {
            setErrorMessage('Login Failed')
            return
        }

        setErrorMessage('')
        location.href = '/'

    }

    return (
        <Box m={2} pt={3}>
            <Container maxWidth="md">
                <Stack spacing={5}>
                    <FormGroup>
                        <TextField id="user-id" label="User ID" variant="standard" onChange={(event) => {
                            const input = event.target.value
                            setUserID(input)
                        }} />
                        <TextField type={showPassword ? "text" : "password"} id="password" label="Password"
                            variant="standard" InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }} onChange={(event) => {
                                const input = event.target.value
                                setPassword(input)
                            }} />
                    </FormGroup>
                    <span className="error-message">{errorMessage}</span>
                    <Button onClick={() => login()} variant="contained">Login</Button>
                </Stack>
            <br />
            <Button onClick={() => location.href = '/signup'} variant="text">Sign up?</Button>
            </Container>
        </Box>
    );
};