import { useEffect, useRef, useState } from "react";

import { CallbackManager } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { BufferMemory } from "langchain/memory";

import {
  Button,
  Form,
  Container,
  Segment,
  Header,
  Feed,
  Checkbox,
} from "semantic-ui-react";
import styles from "@/styles/Test.module.css";

import { HumanTemplate } from "@/utlils/template";

const chat = new ChatOpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // 本番環境ではサーバー側で実行すること
  temperature: 0,
  streaming: true,
});

export const TestPage = () => {
  const chainRef = useRef<ConversationChain>();
  const speechRef = useRef<SpeechSynthesisUtterance>();

  const [speechToggle, setSpeechToggle] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>("あなたの名前を教えてください");

  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);

    chat.callbackManager = CallbackManager.fromHandlers({
      async handleLLMNewToken(token: string) {
        setMessages((prev) => {
          const last = prev.pop();
          return [...prev, last + token];
        });
      },
    });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(HumanTemplate),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const chain = new ConversationChain({
      memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
      prompt: chatPrompt,
      llm: chat,
    });

    chainRef.current = chain;

    const uttr = new SpeechSynthesisUtterance();
    uttr.lang = "ja-JP";
    uttr.volume = 0.2;
    speechRef.current = uttr;

    setLoading(false);
  }, []);

  const onClickButton = async () => {
    setLoading(true);
    setMessages((prev) => [...prev, text, ""]);

    const result = await chainRef?.current?.call({
      input: text,
    });

    setText("");
    setLoading(false);

    if (speechRef.current && speechToggle) {
      console.log(result);
      speechRef.current.text = result?.response;
      speechSynthesis.speak(speechRef.current);
    }
  };

  return (
    <>
      <Container className={styles.customContainer}>
        <Header>お仕事引き継ぎAI 簡易デモ</Header>
        <Checkbox
          toggle
          label="音声読み上げ"
          checked={speechToggle}
          onChange={() => setSpeechToggle((prev) => !prev)}
        />
        <Segment>
          <Form>
            <Form.Field>
              <Form.TextArea
                label={"チャットを送ると前木 弦さん（仮）が答えてくれます"}
                onChange={(e) => setText(e.target.value)}
                value={text}
                disabled={loading}
              />
            </Form.Field>
            <Button onClick={onClickButton} loading={loading}>
              Click
            </Button>
          </Form>
        </Segment>
        <Segment>
          <Feed>
            {messages.map((message, index) => {
              const image =
                index % 2 === 0 ? "/aozora-saiko.png" : "zenki-gen.png";
              return <Feed.Event key={index} summary={message} image={image} />;
            })}
          </Feed>
        </Segment>
      </Container>
    </>
  );
};
