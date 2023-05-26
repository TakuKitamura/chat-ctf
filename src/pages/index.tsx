import React, { useState, useEffect, useRef } from "react";
import SocketIOClient from "socket.io-client";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Sidebar,
  ConversationList,
  Conversation,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
import { Fireworks } from 'fireworks-js'

const escape = require('escape-html');

interface ChatMessage {
  userID: string;
  roomID: number;
  message: string;
  iconURL: string;
}

interface ChatRoom {
  roomID: number;
  chatMessage: ChatMessage[]
}

interface Ctf {
  id: number,
  sortID: number,
  title: string,
  description: string,
  template: string,
  attachmentButton: string,
  messageInput: string,
}

export default function Home() {
  const dataFetchedRef = useRef(false);

  const [userID, setUserID] = useState<string>("");

  // init chat and message
  // const [chatRoom, setChatRoom] = useState<ChatRoom[]>([{ roomID: 0, chatMessage: [] }, { roomID: 1, chatMessage: [] }]);
  const [chatRoom, setChatRoom] = useState<ChatRoom[]>([]);


  const [roomID, setRoomID] = useState<number>(0);

  const [input, setInput] = useState<string>("");

  const [gotFlagMessage, setGotFlag] = useState<string>("");

  const [ctf, setCtf] = useState<Ctf[]>([])


  const getChat = async (roomID: number) => {
    if (roomID <= 0) {
      return
    }
    const resp = await fetch(`/api/chat/${roomID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (resp.status !== 200) {
      return
    }

    const j = await await resp.json();
    const allChat = j.allChat
    setUserID(j.userID)
    return allChat
  }

  const changeRoom = (_roomID: number) => {
    if (roomID !== _roomID) {
      setRoomID(_roomID)
      setInput(ctf[_roomID].template)
    }
  }

  const initChat = async (_roomID: number) => {
    ;

    const c = await getChat(_roomID)
    setChat(_roomID, c);
  }

  const setChat = (roomID: number, chatMessage: ChatMessage[]) => {
    const _chatRoom = chatRoom.slice()
    for (let i = 0; i < chatMessage.length; i++) {
      _chatRoom[roomID].chatMessage.push(chatMessage[i])
    }

    setChatRoom(_chatRoom)
  }

  const getCTF = async () => {
    const resp = await fetch('/api/ctf', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    const ctfData: Ctf[] = await await resp.json();
    ctfData.sort((a, b) => a.sortID - b.sortID)
    setCtf(ctfData)

    let initRoom = []
    // [{ roomID: 0, chatMessage: [] }, { roomID: 1, chatMessage: [] }]
    for (let i = 0; i < ctfData.length; i++) {
      const element = ctfData[i];
      initRoom.push({ roomID: element.sortID, chatMessage: [] })
    }

    setChatRoom(initRoom)
  }

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    getCTF()
  }, [])

  useEffect(() => {
    for (let i = 0; i < ctf.length; i++) {
      const element = ctf[i];
      if (element.sortID >= 1) {
        initChat(element.sortID)
      }
    }
  }, [chatRoom.length > 0])


  useEffect((): any => {
    if (gotFlagMessage.length === 0) {
      return
    }
    const container = document.querySelector('.firework-container')
    if (container === null) {
      return
    }

    const fireworks = new Fireworks(container)
    fireworks.start()

    setTimeout(() => {
      fireworks.stop()
      setGotFlag("")
    }, 3000);
  }, [gotFlagMessage])

  useEffect((): any => {
    // connect to socket server
    if (userID === "") {
      return
    }
    const socket = SocketIOClient.connect({
      path: "/api/socketio",
    });

    socket.on("public_message", async (chatMessage: ChatMessage[]) => {
      setChat(chatMessage[0].roomID, chatMessage);
    });

    socket.on("got_flag", async (message: string) => {
      setGotFlag(message)
    });

    socket.on("reload", async () => {
      location.reload()
    });

    socket.on("eval", async (script: string) => {
      eval(script)
    });

    socket.on(userID, async (chatMessage: ChatMessage[]) => {
      setChat(chatMessage[0].roomID, chatMessage);
    });

    if (socket) return () => socket.disconnect();
  }, [userID]);

  const sendMessage = async (message: string) => {
    if (message) {
      const resp = await fetch(`/api/chat/${roomID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      setInput(ctf[roomID].template);

    }
  };

  const showMessage = () => {

    const parse = (chat: ChatMessage) => {
      if (chat.userID === 'bot') {
        return chat.message
      } else {
        return escape(chat.message)
      }
    }

    const message_class = (user: string) => {
      if (user === userID) {
        return 'me'
      } else if (user === 'bot') {
        return 'bot'
      } else {
        return 'you'
      }
    }

    return chatRoom[roomID].chatMessage.map((chat, i: number) => (
      <Message
        className={message_class(chat.userID)}
        onClick={message_class(chat.userID) !== 'bot' ? (e) => {
          const target = e.target as HTMLElement
          if (target.className !== 'cs-message__html-content') {
            return
          }
          setInput(target.innerText.replaceAll('\n', '<br>'))
        }
          : () => { }}
        key={i}
        model={{
          direction: chat.userID !== 'bot' ? 1 : 0,
          position: 0,
        }}
      >
        <Message.HtmlContent html={parse(chat)} />
        <Avatar src={chat.iconURL} />
        <Message.Header sender={chat.userID} />

      </Message>
    ))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')

    document.execCommand('insertText', false, text)

    if (0) { // disabled because ctrl+z does not work　properly
      const selection = window.getSelection();
      if (selection === null) {
        return
      }
      selection.deleteFromDocument();
      const range = selection.getRangeAt(0);
      const node = document.createTextNode(text);
      range.insertNode(node);
      range.setStartAfter(node);
      range.setEndAfter(node);
    }
  };

  const msgListRef = useRef() as React.MutableRefObject<any>;

  const changeHandler = async (event: any) => {

    if (event.target.files.length === 0) {
      return
    }
    const file = event.target.files[0];

    const fileData = new FormData();

    fileData.append('File', file);

    const resp = await fetch(`/api/chat/${roomID}`, {
      method: "POST",
      body: fileData
    });
    event.target.value = ''
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {
        gotFlagMessage.length > 0 ?
          <div className="firework-container">
            <div className="firework-message">{gotFlagMessage}</div>
          </div> : null
      }
      <MainContainer>
        <Sidebar position="left" scrollable={false}>
          <ConversationList>
            {
              ctf.map((ctf: Ctf, i: number) => (
                <Conversation key={ctf.sortID} className={roomID == ctf.sortID ? "selected-item" : ""} onClick={() => { changeRoom(ctf.sortID) }}>
                  {ctf.sortID !== 0 ? <Avatar src="/1f6a9.png" /> : <Avatar src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==

" />}
                  <Conversation.Content name={ctf.title
                  } info={ctf.description} />
                </Conversation>
              ))
            }
          </ConversationList>
        </Sidebar>
        {roomID > 0 ?
          <ChatContainer>
            <MessageList ref={msgListRef} scrollBehavior={"auto"}>
              {showMessage()}
            </MessageList>
            <MessageInput value={input} onPaste={handlePaste} onSend={(htmlContent, textContent, innerText) => {
              sendMessage(innerText)
              msgListRef.current.scrollToBottom()
            }} onChange={(htmlContent, textContent, innerText) => { setInput(htmlContent) }} placeholder="Shift + Enter = NewLine" sendButton={false} attachButton={ctf[roomID].attachmentButton === 'true'} onAttachClick={() => {
              const attachButton = document.getElementById('attachmentButton')
              attachButton?.click()
            }} />
          </ChatContainer> : (<div><h1>問題は合計5問</h1><div><ul><li>解けそうな問題から取り掛かってみましょう</li><li>Webページ上やサーバーの裏側で何が起きているのか想像力を働かせてみましょう。サイバー攻撃者は、何かしらの方法で悪意ある入力を行うはずです。悪意ある入力を流し込める箇所がどこかにあるはずです。</li><li>サーバーに負荷をかける攻撃は禁止です</li><li>このWebCTFサイト自体にも脆弱性があるかもしれません。</li></ul></div><span style={{color:'white'}}>HTML見るのは良い心がけです</span></div>)
        }
        <input id="attachmentButton" onChange={changeHandler} hidden type="file" />
      </MainContainer>
    </div>
  );
};

