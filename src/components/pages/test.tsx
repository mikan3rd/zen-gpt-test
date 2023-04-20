import { useEffect, useRef, useState } from "react";

import { OpenAI } from "langchain/llms/openai";
import { CallbackManager } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage } from "langchain/schema";
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
  Message,
} from "semantic-ui-react";
import styles from "@/styles/Test.module.css";

import { HumanTemplate } from "@/utlils/template";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const model = new OpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // 本番環境ではサーバー側で実行すること
  temperature: 0.9,
});

const chat = new ChatOpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // 本番環境ではサーバー側で実行すること
  temperature: 0,
  streaming: true,
});

export const TestPage = () => {
  const chainRef = useRef<ConversationChain>();

  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>("あなたの名前を教えてください");
  const [answer, setAnswer] = useState<string>("");

  useEffect(() => {
    setLoading(true);

    chat.callbackManager = CallbackManager.fromHandlers({
      async handleLLMNewToken(token: string) {
        setAnswer((prev) => prev + token);
      },
    });

    console.log(HumanTemplate);
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

    setLoading(false);
  }, []);

  const onClickButton = async () => {
    setLoading(true);
    setAnswer("");

    // const res = await model.call(text);
    // console.log(res);
    // setAnswer(res.text);

    await chainRef?.current?.call({
      input: text,
    });

    setLoading(false);
  };

  return (
    <>
      <Container className={styles.customContainer}>
        <Header>Zen GPT</Header>
        <Segment>
          <Form>
            <Form.Field>
              <Form.TextArea
                label={"質問を入力してください"}
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
          <Message header="回答" content={answer} />
        </Segment>
      </Container>
    </>
  );
};
