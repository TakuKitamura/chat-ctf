import React, { useState  } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
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

export default function SignUp() {

  const [userID, setUserID] = useState('');
  const [errorUserID, setErrorUserID] = useState(false)

  const [password, setPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState(false)


  const [iconURL, setIconURL] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const [errorMessage, setErrorMessage] = useState("");

  const emptyImage = '/1f600.png'

  const imgSrcSanitize = (src: string) => {
    let url
    try {
      url = new URL(src)
    } catch {
      return emptyImage
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return emptyImage
    }
    return url.href
  }

  const signUp = async () => {
    const resp = await fetch(`/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "userID": userID,
        "password": password,
        "iconURL": iconURL.length > 0 ? iconURL : (location.origin + emptyImage)
      }),
    });

    if (resp.status === 200) {
      setErrorMessage('')
      location.href = '/login'
      return
    } else if (resp.status !== 400) {
      setErrorMessage('Sign Up Failed')
      return
    }
    const j = await await resp.json();
    setErrorMessage(j.message)
  }

  return (
    <Box m={2} pt={3}>
      <Container maxWidth="md">
        <Stack spacing={5}>
          <FormGroup>
            <TextField id="user-id" label="User ID" variant="standard" error={errorUserID} helperText={errorUserID ? "3文字以上、15文字以下で[大文字, 小文字アルファベット, 数字, _]4種から構成される半角文字列" : null} onChange={(event) => {
              const input = event.target.value
              const regex = /^[a-zA-Z0-9_]{3,15}$/g;
              if (input.match(regex) === null) {
                setErrorUserID(true)
                setUserID("")
              } else {
                setErrorUserID(false)
                setUserID(input)
              }
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
              }} error={errorPassword} helperText={errorPassword ? "8文字以上、20文字以下で[大文字, 小文字アルファベット, 数字]の3種全てを少なくても1文字以上含む半角文字列" : null} onChange={(event) => {
                const input = event.target.value
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/g;
                if (input.match(regex) === null) {
                  setErrorPassword(true)
                  setPassword("")
                } else {
                  setErrorPassword(false)
                  setPassword(input)
                }
              }} />
            <TextField id="icon" onChange={(event) => setIconURL(event.target.value)} label="Icon URL [Optional]" variant="standard" />
          </FormGroup>
          <span className="error-message">{errorMessage}</span>
          <Button onClick={() => signUp()} variant="contained">Sign Up</Button>
          <Box>
            <h3>Preview</h3>
            <MainContainer>
              <ChatContainer>
                <MessageList>
                  <Message className="me" model={{ direction: 1, position: 0 }}>
                    <Avatar src={imgSrcSanitize(iconURL)} onError={({ currentTarget }) => {
                      (currentTarget.childNodes[0] as HTMLImageElement).src = emptyImage
                    }} />
                    <Message.TextContent text={`My password is ${showPassword ? password : "*".repeat(password.length)}`} />
                    <Message.Header sender={userID.trim().length > 0 ? userID : 'User Name'} />
                  </Message>
                </MessageList>
              </ChatContainer>
            </MainContainer>
          </Box>
        </Stack>
        <br/>
        <Button onClick={() => location.href = '/login'} variant="text">Login?</Button>
      </Container>

    </Box>
  );
};

