import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import Message from "./Components/Message";
import {
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "./firebase.js";

import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

const db = getFirestore(app);

const auth = getAuth(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider);
};

const logoutHandler = () => {
  signOut(auth);
};

const App = () => {
  const [user, setUser] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "Messages"), {
        text: msg,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),
      });

      setMsg("");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (data) => {
      setUser(data);
    });

    onSnapshot(collection(db, "Messages"), (snap) => {
      snap.docs.map((item) => {
        const id = item.id;
        return { id, ...item.data() };
      });
    });
  }, []);

  return (
    <Box bg={"green.500"}>
      {user ? (
        <Container bg={"white"} height={"100vh"}>
          <VStack h={"full"} padding={"4"}>
            <Button onClick={logoutHandler} w={"full"} colorScheme="red">
              Logout
            </Button>
            <VStack
              flexDirection={"column-reverse"}
              overflowY={"auto"}
              h={"full"}
              w={"full"}
            >
              {messages.map((item, index) => {
                <Message
                  key={index}
                  user={item.uri === user.uid ? "me" : ""}
                  text={item.text}
                  uri={item.uri}
                />;
              })}
            </VStack>

            <form
              onSubmit={
                msg === ""
                  ? (e) => {
                      e.preventDefault();
                    }
                  : submitHandler
              }
              style={{ width: "100%" }}
            >
              <HStack>
                <Input
                  value={msg}
                  onChange={(e) => {
                    setMsg(e.target.value);
                  }}
                  w={"full"}
                  placeholder="Message"
                  border={"2px solid blue"}
                ></Input>
                <Button type="submit" colorScheme="purple">
                  Send
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack justifyContent={"center"} h={"100vh"}>
          <Button onClick={loginHandler}>Sign in with Google</Button>
        </VStack>
      )}
    </Box>
  );
};

export default App;
